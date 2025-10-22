const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

// Find the workspace root
const workspaceRoot = path.resolve(__dirname, "../..");
const projectRoot = __dirname;

const config = getSentryExpoConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages, and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

// 4. Add TypeScript declaration files to source extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, "d.ts"];

// Apply NativeWind configuration
module.exports = withNativeWind(config, { input: "./global.css" });