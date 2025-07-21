module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Tamagui plugin temporarily removed to avoid parsing errors
    ],
  }
}