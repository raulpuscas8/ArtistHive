// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Allow .cjs files (needed by some Firebase packages)
config.resolver.sourceExts.push("cjs");

// Turn off strict package-exports resolution so Expo Go can load Firebase Auth et al.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
