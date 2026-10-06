const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Tambahkan ekstensi 'wasm' agar dikenali oleh bundler
config.resolver.assetExts.push('wasm');

module.exports = config;