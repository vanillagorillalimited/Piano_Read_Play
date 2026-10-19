Pod::Spec.new do |s|
  s.name = 'ReadplayMidi'
  s.version = '1.0.0'
  s.summary = 'MIDI keyboards for Read & Play'
  s.license = 'UNLICENSED'
  s.homepage = 'https://example.com'
  s.author = 'Read & Play'
  s.source = { :git => 'https://example.com/readplay-midi.git', :tag => s.version.to_s }
  s.source_files = 'ios/Sources/**/*.swift'
  s.ios.deployment_target = '15.0'
  s.frameworks = 'CoreMIDI', 'CoreAudioKit'
  s.dependency 'Capacitor'
  s.swift_version = '5.9'
end
