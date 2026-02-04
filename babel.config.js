module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@app": "./app",
            "@components": "./components",
            "@constants": "./constants",
            "@hooks": "./hooks",
            "@i18n": "./i18n",
            "@lib": "./lib",
            "@services": "./services",
            "@store": "./store",
            "@types": "./types",
            "@assets": "./assets",
            "@scripts": "./scripts",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
