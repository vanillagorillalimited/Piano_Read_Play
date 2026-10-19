import Foundation
import UIKit
import CoreMIDI
import CoreAudioKit
import Capacitor

/// MIDI keyboards for Read & Play.
/// Listens to every MIDI source (USB through Apple's camera adapter, Bluetooth once paired, network)
/// and passes note and pedal messages to the web app as "midiMessage" events.
@objc(ReadPlayMidiPlugin)
public class ReadPlayMidiPlugin: CAPPlugin, CAPBridgedPlugin, UIAdaptivePresentationControllerDelegate {
    public let identifier = "ReadPlayMidiPlugin"
    public let jsName = "ReadPlayMidi"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "listInputs", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "pairBluetooth", returnType: CAPPluginReturnPromise)
    ]

    private var client = MIDIClientRef()
    private var port = MIDIPortRef()
    private var started = false      // the MIDI client and input port exist
    private var listening = false    // between start() and stop()
    private var connected = Set<MIDIUniqueID>()
    private var pairCall: CAPPluginCall?

    // MARK: - Methods called from the app

    // All state is only ever touched on the main thread.
    @objc func start(_ call: CAPPluginCall) {
        DispatchQueue.main.async { self.startOnMain(call) }
    }

    private func startOnMain(_ call: CAPPluginCall) {
        if !started {
            var status = MIDIClientCreateWithBlock("Read & Play" as CFString, &client) { [weak self] notification in
                guard let self = self else { return }
                let id = notification.pointee.messageID
                if id == .msgSetupChanged || id == .msgObjectAdded || id == .msgObjectRemoved {
                    DispatchQueue.main.async {
                        self.connectAll()
                        self.notifyDevices()
                    }
                }
            }
            guard status == noErr else { call.reject("Couldn't start MIDI (\(status))"); return }
            status = MIDIInputPortCreateWithProtocol(client, "Read & Play input" as CFString, ._1_0, &port) { [weak self] list, _ in
                self?.receive(list)
            }
            guard status == noErr else { call.reject("Couldn't open a MIDI input (\(status))"); return }
            started = true
        }
        listening = true
        connectAll()
        call.resolve(["inputs": inputNames()])
    }

    @objc func stop(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.listening = false
            if self.started {
                for i in 0..<MIDIGetNumberOfSources() { MIDIPortDisconnectSource(self.port, MIDIGetSource(i)) }
                self.connected.removeAll()
            }
            call.resolve()
        }
    }

    @objc func listInputs(_ call: CAPPluginCall) {
        DispatchQueue.main.async { call.resolve(["inputs": self.inputNames()]) }
    }

    /// Shows Apple's Bluetooth MIDI pairing screen. Resolves when the person taps Done.
    @objc func pairBluetooth(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if self.pairCall != nil { call.reject("Pairing is already open"); return }
            guard let host = self.bridge?.viewController else { call.reject("No screen to show pairing on"); return }
            let central = CABTMIDICentralViewController()
            central.title = "Bluetooth keyboards"
            central.navigationItem.rightBarButtonItem = UIBarButtonItem(barButtonSystemItem: .done, target: self, action: #selector(self.pairingDone))
            let nav = UINavigationController(rootViewController: central)
            nav.modalPresentationStyle = .formSheet
            nav.presentationController?.delegate = self
            self.pairCall = call
            host.present(nav, animated: true)
        }
    }

    @objc private func pairingDone() {
        bridge?.viewController?.dismiss(animated: true) { self.finishPairing() }
    }

    public func presentationControllerDidDismiss(_ presentationController: UIPresentationController) {
        finishPairing()
    }

    private func finishPairing() {
        if started { connectAll() }
        let names = inputNames()
        pairCall?.resolve(["inputs": names, "connected": names])
        pairCall = nil
        notifyDevices()
    }

    // MARK: - Sources

    private func connectAll() {
        guard started && listening else { return }
        // forget sources that have gone, so a Bluetooth keyboard that reconnects (same ID, new endpoint) is connected again
        var current = Set<MIDIUniqueID>()
        for i in 0..<MIDIGetNumberOfSources() {
            var id: MIDIUniqueID = 0
            MIDIObjectGetIntegerProperty(MIDIGetSource(i), kMIDIPropertyUniqueID, &id)
            current.insert(id)
        }
        connected.formIntersection(current)
        for i in 0..<MIDIGetNumberOfSources() {
            let src = MIDIGetSource(i)
            var id: MIDIUniqueID = 0
            MIDIObjectGetIntegerProperty(src, kMIDIPropertyUniqueID, &id)
            if connected.contains(id) { continue }
            if MIDIPortConnectSource(port, src, nil) == noErr { connected.insert(id) }
        }
    }

    private func inputNames() -> [String] {
        var names: [String] = []
        for i in 0..<MIDIGetNumberOfSources() {
            let src = MIDIGetSource(i)
            var offline: Int32 = 0
            MIDIObjectGetIntegerProperty(src, kMIDIPropertyOffline, &offline)
            if offline != 0 { continue }
            var cfName: Unmanaged<CFString>?
            MIDIObjectGetStringProperty(src, kMIDIPropertyDisplayName, &cfName)
            let name = (cfName?.takeRetainedValue() as String?) ?? "MIDI keyboard"
            if name.hasPrefix("Network Session") { continue }   // iOS's own network MIDI, not a keyboard
            names.append(name)
        }
        return names
    }

    private func notifyDevices() {
        let names = inputNames()
        DispatchQueue.main.async { self.notifyListeners("devicesChanged", data: ["inputs": names]) }
    }

    // MARK: - Incoming notes

    /// Messages arrive as MIDI 1.0 "universal packets": one 32-bit word per note-on, note-off or controller change.
    private func receive(_ list: UnsafePointer<MIDIEventList>) {
        var messages: [[Int]] = []
        for packet in list.unsafeSequence() {
            // read only the words this packet has (packets are packed, so don't copy the whole fixed-size array)
            let count = min(Int(packet.pointee.wordCount), 64)
            let base = UnsafeRawPointer(packet) + MemoryLayout<MIDIEventPacket>.offset(of: \MIDIEventPacket.words)!
            let words = Array(UnsafeBufferPointer(start: base.assumingMemoryBound(to: UInt32.self), count: count))
            for w in words where (w >> 28) == 0x2 {   // MIDI 1.0 channel voice message
                let status = Int((w >> 16) & 0xFF), d1 = Int((w >> 8) & 0x7F), d2 = Int(w & 0x7F)
                let kind = status & 0xF0
                if kind == 0x80 || kind == 0x90 || kind == 0xB0 { messages.append([status, d1, d2]) }
            }
        }
        guard !messages.isEmpty else { return }
        DispatchQueue.main.async {
            for m in messages { self.notifyListeners("midiMessage", data: ["data": m]) }
        }
    }
}
