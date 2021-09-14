module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: 'Music Writer',
        icon: './src/assets/icons/app-icon.png',
        win: {
          icon: './src/assets/icons/app-icon.png'
        },
        linux: {
          category: 'Utility',
          target: 'AppImage',
          icon: './src/assets/icons/app-icon.png'
        }
      }
    }
  }
};
