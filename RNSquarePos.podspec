
Pod::Spec.new do |s|
  s.name         = "RNSquarePos"
  s.version      = "1.0.13"
  s.summary      = "RNSquarePos"
  s.description  = <<-DESC
                  RNSquarePos
                   DESC
  s.homepage     = "https://github.com/matix-io/react-native-square-pos"
  s.license      = "MIT"
  # s.license      = { :type => "MIT", :file => "FILE_LICENSE" }
  s.author             = { "author" => "connor@matix.io" }
  s.platform     = :ios, "7.0"
  s.source       = { :git => "https://github.com/matix-io/react-native-square-pos.git", :tag => "master" }
  s.source_files  = "ios/**/*.{h,m}"
  s.requires_arc = true


  s.dependency "React"
  s.dependency "SquarePointOfSaleSDK"
end

  