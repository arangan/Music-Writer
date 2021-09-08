module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: 'Music Writer',
        win: {
          icon: './src/assets/icons/app-icon.png'
        },
        linux: {
          icon: './src/assets/icons/app-icon.png'
        }
      }
    }
  }
};
