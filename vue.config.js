module.exports = {
  publicPath: process.env.NODE_ENV === 'development' ? '' : '/GdmapPages/',
  configureWebpack: (config) => {
    return {
      name: '基于高德地图2.0、Vue2.0',
    }
  },
}
