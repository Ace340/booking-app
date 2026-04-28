#!/bin/bash
set -e

echo "🚀 Starting Mobile Build Process..."

# Check if EXPO_TOKEN is set
if [ -z "$EXPO_TOKEN" ]; then
  echo "❌ ERROR: EXPO_TOKEN environment variable is required for EAS builds"
  echo "   Get your token from: https://expo.dev/accounts/[account]/settings/access-tokens"
  exit 1
fi

# Login to Expo
echo "📝 Logging in to Expo..."
npx expo-cli login --non-interactive

# Function to build for a platform
build_platform() {
  local platform=$1
  echo "🔨 Building for platform: $platform"

  if [ "$platform" == "android" ] || [ "$platform" == "all" ]; then
    echo "📱 Building Android APK..."
    eas build --platform android --non-interactive --output ./build/android/app.apk || {
      echo "❌ Android build failed"
      return 1
    }
  fi

  if [ "$platform" == "ios" ] || [ "$platform" == "all" ]; then
    echo "📱 Building iOS IPA..."
    eas build --platform ios --non-interactive --output ./build/ios/app.ipa || {
      echo "❌ iOS build failed"
      return 1
    }
  fi

  return 0
}

# Create build directory
mkdir -p ./build/android ./build/ios

# Build based on PLATFORM environment variable
case "$PLATFORM" in
  android)
    build_platform "android"
    ;;
  ios)
    build_platform "ios"
    ;;
  all)
    build_platform "android"
    build_platform "ios"
    ;;
  *)
    echo "⚠️  WARNING: Invalid PLATFORM '$PLATFORM'. Defaulting to 'android'."
    build_platform "android"
    ;;
esac

echo "✅ Build completed successfully!"
echo "📦 Build artifacts are in: ./build/"

# List build artifacts
if [ -f "./build/android/app.apk" ]; then
  echo "  - Android APK: ./build/android/app.apk"
fi
if [ -f "./build/ios/app.ipa" ]; then
  echo "  - iOS IPA: ./build/ios/app.ipa"
fi
