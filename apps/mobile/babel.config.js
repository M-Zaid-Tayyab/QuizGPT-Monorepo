module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Must come before Reanimated
      "react-native-worklets/plugin",
      // Keep Reanimated plugin last
      "react-native-reanimated/plugin",
    ],
  };
};
