module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: 'Music Writer',
        icon: './app-icon.png',
        win: {
          icon: './src/assets/icons/app-icon.png'
        },
        linux: {
          category: 'Utility',
          target: 'AppImage',
          icon: './app-icon.png'
        }
      }
    }
  }
};
