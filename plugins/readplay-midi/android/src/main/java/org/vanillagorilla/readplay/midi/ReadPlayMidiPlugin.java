package org.vanillagorilla.readplay.midi;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.LocationManager;
import android.media.midi.MidiDevice;
import android.media.midi.MidiDeviceInfo;
import android.media.midi.MidiManager;
import android.media.midi.MidiOutputPort;
import android.media.midi.MidiReceiver;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.ParcelUuid;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * MIDI keyboards for Read & Play: USB (through a USB OTG adapter) and Bluetooth LE MIDI.
 * Every note-on, note-off and controller message is passed to the web app as a "midiMessage" event.
 */
@CapacitorPlugin(
    name = "ReadPlayMidi",
    permissions = {
        @Permission(alias = "bluetooth", strings = { Manifest.permission.BLUETOOTH_SCAN, Manifest.permission.BLUETOOTH_CONNECT }),
        @Permission(alias = "bluetoothLegacy", strings = { Manifest.permission.ACCESS_FINE_LOCATION })
    }
)
public class ReadPlayMidiPlugin extends Plugin {
    // The standard Bluetooth LE MIDI service
    private static final UUID BLE_MIDI_SERVICE = UUID.fromString("03B80E5A-EDE8-4B33-A751-6CE34EC4C700");
    private static final long SCAN_MS = 8000;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private MidiManager midi;
    private MidiManager.DeviceCallback deviceCallback;
    private final Map<Integer, MidiDevice> devices = Collections.synchronizedMap(new HashMap<>());
    private final Map<Integer, MidiOutputPort> ports = Collections.synchronizedMap(new HashMap<>());
    private final Map<Integer, String> names = Collections.synchronizedMap(new HashMap<>());

    // ---- methods called from the app ----

    @PluginMethod
    public void start(PluginCall call) {
        if (!getContext().getPackageManager().hasSystemFeature(PackageManager.FEATURE_MIDI)) {
            call.reject("This phone or tablet doesn't support MIDI");
            return;
        }
        if (midi == null) {
            midi = (MidiManager) getContext().getSystemService(Context.MIDI_SERVICE);
            deviceCallback = new MidiManager.DeviceCallback() {
                @Override public void onDeviceAdded(MidiDeviceInfo info) { open(info); }
                @Override public void onDeviceRemoved(MidiDeviceInfo info) { close(info.getId()); notifyDevices(); }
            };
            midi.registerDeviceCallback(deviceCallback, handler);
        }
        for (MidiDeviceInfo info : allDevices()) open(info);
        // opening is asynchronous: answer once the devices have had a moment to open
        handler.postDelayed(() -> call.resolve(inputsResult()), 400);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (midi != null && deviceCallback != null) midi.unregisterDeviceCallback(deviceCallback);
        midi = null;
        deviceCallback = null;
        for (Integer id : new ArrayList<>(devices.keySet())) close(id);
        call.resolve();
    }

    @PluginMethod
    public void listInputs(PluginCall call) {
        call.resolve(inputsResult());
    }

    /** Scans for Bluetooth LE MIDI keyboards for a few seconds and connects to every one it finds. */
    @PluginMethod
    public void pairBluetooth(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (getPermissionState("bluetooth") != PermissionState.GRANTED) { requestPermissionForAlias("bluetooth", call, "afterBluetoothPermission"); return; }
        } else if (getPermissionState("bluetoothLegacy") != PermissionState.GRANTED) {
            requestPermissionForAlias("bluetoothLegacy", call, "afterBluetoothPermission");
            return;
        }
        scan(call);
    }

    @PermissionCallback
    private void afterBluetoothPermission(PluginCall call) {
        boolean ok = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
            ? getPermissionState("bluetooth") == PermissionState.GRANTED
            : getPermissionState("bluetoothLegacy") == PermissionState.GRANTED;
        if (ok) scan(call); else call.reject("Bluetooth permission was not given");
    }

    // ---- Bluetooth ----

    @SuppressWarnings("MissingPermission")
    private void scan(PluginCall call) {
        if (midi == null) midi = (MidiManager) getContext().getSystemService(Context.MIDI_SERVICE);
        if (midi == null || !getContext().getPackageManager().hasSystemFeature(PackageManager.FEATURE_MIDI)) { call.reject("This phone or tablet doesn't support MIDI"); return; }
        // Android 11 and earlier only find Bluetooth devices with Location switched on
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S && Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            LocationManager lm = (LocationManager) getContext().getSystemService(Context.LOCATION_SERVICE);
            if (lm != null && !lm.isLocationEnabled()) { call.reject("Turn on Location to find Bluetooth keyboards"); return; }
        }
        BluetoothManager bm = (BluetoothManager) getContext().getSystemService(Context.BLUETOOTH_SERVICE);
        BluetoothAdapter adapter = bm != null ? bm.getAdapter() : null;
        if (adapter == null || !adapter.isEnabled()) { call.reject("Turn Bluetooth on, then try again"); return; }
        BluetoothLeScanner scanner = adapter.getBluetoothLeScanner();
        if (scanner == null) { call.reject("Bluetooth scanning isn't available"); return; }
        final Map<String, BluetoothDevice> found = new HashMap<>();
        final ScanCallback cb = new ScanCallback() {
            @Override public void onScanResult(int type, ScanResult result) {
                BluetoothDevice d = result.getDevice();
                if (d != null) found.put(d.getAddress(), d);
            }
        };
        List<ScanFilter> filters = new ArrayList<>();
        filters.add(new ScanFilter.Builder().setServiceUuid(new ParcelUuid(BLE_MIDI_SERVICE)).build());
        ScanSettings settings = new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build();
        try { scanner.startScan(filters, settings, cb); }
        catch (SecurityException e) { call.reject("Bluetooth permission was not given"); return; }
        handler.postDelayed(() -> {
            try { scanner.stopScan(cb); } catch (SecurityException ignored) { }
            final JSArray connected = new JSArray();
            if (found.isEmpty()) { JSObject r = inputsResult(); r.put("connected", connected); call.resolve(r); return; }
            for (BluetoothDevice d : found.values()) {
                String label;
                try { label = d.getName() != null ? d.getName() : "Bluetooth keyboard"; } catch (SecurityException e) { label = "Bluetooth keyboard"; }
                connected.put(label);
                midi.openBluetoothDevice(d, device -> { if (device != null) listen(device); }, handler);
            }
            // give the connections a moment, then report what's connected
            handler.postDelayed(() -> { JSObject r = inputsResult(); r.put("connected", connected); call.resolve(r); }, 2500);
        }, SCAN_MS);
    }

    // ---- devices ----

    @SuppressWarnings("deprecation")
    private List<MidiDeviceInfo> allDevices() {
        List<MidiDeviceInfo> list = new ArrayList<>();
        if (midi == null) return list;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) list.addAll(midi.getDevicesForTransport(MidiManager.TRANSPORT_MIDI_BYTE_STREAM));
        else Collections.addAll(list, midi.getDevices());
        return list;
    }

    private void open(MidiDeviceInfo info) {
        if (info == null || info.getOutputPortCount() == 0 || devices.containsKey(info.getId())) return;
        midi.openDevice(info, device -> { if (device != null) listen(device); }, handler);
    }

    /** A keyboard's "output" port is where its notes come out, so that's the one to read. */
    private void listen(MidiDevice device) {
        MidiDeviceInfo info = device.getInfo();
        int id = info.getId();
        if (devices.containsKey(id) || info.getOutputPortCount() == 0) {
            // already listening to this keyboard (e.g. pairing and plugging-in both opened it): close the extra connection
            try { device.close(); } catch (IOException ignored) { }
            return;
        }
        MidiOutputPort port = device.openOutputPort(0);
        if (port == null) { try { device.close(); } catch (IOException ignored) { } return; }
        port.connect(new Parser());
        devices.put(id, device);
        ports.put(id, port);
        Bundle p = info.getProperties();
        String name = p.getString(MidiDeviceInfo.PROPERTY_NAME);
        if (name == null) name = p.getString(MidiDeviceInfo.PROPERTY_PRODUCT);
        names.put(id, name != null ? name : "MIDI keyboard");
        notifyDevices();
    }

    private void close(int id) {
        MidiOutputPort port = ports.remove(id);
        MidiDevice device = devices.remove(id);
        names.remove(id);
        try { if (port != null) port.close(); } catch (IOException ignored) { }
        try { if (device != null) device.close(); } catch (IOException ignored) { }
    }

    private JSObject inputsResult() {
        JSArray list = new JSArray();
        synchronized (names) { for (String n : names.values()) list.put(n); }
        JSObject r = new JSObject();
        r.put("inputs", list);
        return r;
    }

    private void notifyDevices() { notifyListeners("devicesChanged", inputsResult()); }

    @Override
    protected void handleOnDestroy() {
        if (midi != null && deviceCallback != null) midi.unregisterDeviceCallback(deviceCallback);
        for (Integer id : new ArrayList<>(devices.keySet())) close(id);
    }

    /** Splits the incoming bytes into messages (handling running status) and sends notes and controllers on. */
    private class Parser extends MidiReceiver {
        private int status = 0, need = 0, have = 0;
        private final int[] data = new int[2];
        private boolean sysex = false;

        @Override
        public void onSend(byte[] msg, int offset, int count, long timestamp) {
            for (int i = offset; i < offset + count; i++) {
                int b = msg[i] & 0xFF;
                if (b >= 0xF8) continue;                         // clock and other real-time bytes
                if (b == 0xF0) { sysex = true; continue; }
                if (b == 0xF7) { sysex = false; continue; }
                if (sysex) continue;
                if ((b & 0x80) != 0) {                           // a new status byte
                    status = b; have = 0;
                    int kind = b & 0xF0;
                    need = (kind == 0xC0 || kind == 0xD0) ? 1 : (b >= 0xF0 ? 0 : 2);
                    continue;
                }
                if (status == 0 || need == 0) continue;
                data[have++] = b;
                if (have == need) {
                    int kind = status & 0xF0;
                    if (kind == 0x80 || kind == 0x90 || kind == 0xB0) send(status, data[0], need > 1 ? data[1] : 0);
                    have = 0;                                    // running status: the next bytes reuse it
                }
            }
        }

        private void send(int s, int d1, int d2) {
            JSArray arr = new JSArray();
            arr.put(s); arr.put(d1); arr.put(d2);
            JSObject ev = new JSObject();
            ev.put("data", arr);
            notifyListeners("midiMessage", ev);
        }
    }
}
