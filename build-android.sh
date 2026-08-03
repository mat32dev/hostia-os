#!/bin/bash
# HosT.ia — Build Android APKs
# Usage: ./build-android.sh [pos|guard|all]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APPS_DIR="$SCRIPT_DIR/apps"

build_pos() {
    echo "🏗️  Building HosTia POS Android..."
    cd "$APPS_DIR/pos-android"
    npm ci
    npx cap sync android
    cd android
    chmod +x gradlew
    ./gradlew assembleDebug
    echo "✅ APK: apps/pos-android/android/app/build/outputs/apk/debug/app-debug.apk"
}

build_guard() {
    echo "🏗️  Building HosTia Guard Android..."
    cd "$APPS_DIR/guard-android"
    npm ci
    npx cap sync android
    cd android
    chmod +x gradlew
    ./gradlew assembleDebug
    echo "✅ APK: apps/guard-android/android/app/build/outputs/apk/debug/app-debug.apk"
}

build_all() {
    build_pos
    build_guard
}

case "${1:-all}" in
    pos)
        build_pos
        ;;
    guard)
        build_guard
        ;;
    all)
        build_all
        ;;
    *)
        echo "Usage: $0 [pos|guard|all]"
        exit 1
        ;;
esac
