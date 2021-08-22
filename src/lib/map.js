import AMapLoader from '@amap/amap-jsapi-loader'

export default class GdMap {
  constructor() {
    // 加载完成的高德地图
    this.Gdmap = null
    this.mouseTool = null
    this.markResult = null
  }

  // 加载地图
  LoaderMap(config) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const { key, version, plugins, AMapUI, Loca } = config
      const options = {
        key: key, // 申请好的Web端开发者Key
        version: version || '2.0', // 指定要加载的 JSAPI 的版本
        plugins: plugins,
        AMapUI: AMapUI,
        Loca: Loca,
      }
      try {
        const Gdmap = await AMapLoader.load(options)
        this.Gdmap = Gdmap
        resolve(Gdmap)
      } catch (error) {
        console.warn(error)
        reject(error)
      }
    })
  }

  /**
   *  @param {Object} 地图实例
   *  - amap: {Object} 地图实例
   *  - lnglat: {Array} 经纬度信息
   *  @description
   */
  setMapCenter(options) {
    if (!options.amap) {
      return console.warn('缺少地图实例')
    }
    if (!options.lnglat) {
      return console.warn('缺少经纬度信息')
    }
    const position = new this.Gdmap.LngLat(...options.lnglat)
    options.amap.setCenter(position)
  }

  /**
   *  @param {Object} 地图实例对象
   *  - amap: 地图实例
   *  @description 构建鼠标工具
   */
  makeMouseTool(amap) {
    if (!amap) {
      return console.warn('没有地图对象')
    }
    return new Promise((resolve, reject) => {
      if (this.mouseTool && 'CLASS_NAME' in this.mouseTool && this.mouseTool.CLASS_NAME === 'AMap.MouseTool') {
        this.mouseToolClose()
        resolve(this.mouseTool)
      } else {
        this.mouseTool = new this.Gdmap.MouseTool(amap)
        resolve(this.mouseTool)
      }
    })
  }

  /**
   *  @param {Boolean} 是否清除覆盖物
   *  @description 关闭鼠标工具
   */
  mouseToolClose(isclear) {
    if (this.mouseTool && this.mouseTool?.CLASS_NAME === 'AMap.MouseTool') {
      if (!isclear || isclear === undefined) {
        this.mouseTool.close() // 关闭但不清除覆盖物
      } else {
        this.mouseTool.close(true) // 关闭并清除覆盖物
      }
    } else {
      console.warn('没有鼠标工具！')
    }
  }

  /**
   *  @param {Object}
   *  - amap: 地图实例
   *  - callback?: 回调
   *  @description 鼠标测距
   */
  mouseToolRanging(options) {
    if (!options.amap) {
      return console.warn('没有地图对象')
    }
    this.makeMouseTool(options.amap).then((mousetool) => {
      if (!('ruler' in mousetool) || mousetool.ruler === null) {
        mousetool.rule({ zIndex: 200 })
      } else if ('ruler' in mousetool && mousetool.ruler !== null) {
        mousetool.ruler.turnOn()
      }
      mousetool.on('draw', (event) => {
        console.log('测距：', event)
        options.callback && options.callback()
      })
    })
  }

  /**
   *  @param {Object}
   *  - amap: 地图实例
   *  - areaStyle?: 测量工具样式
   *  - callback?: 回调
   *  @description 鼠标测面
   */
  mouseToolArea(options) {
    if (!options.amap) {
      return console.warn('没有地图对象')
    }
    this.makeMouseTool(options.amap).then((mousetool) => {
      const areaStyle = {
        strokeColor: '#80d8ff',
        fillColor: '#80d8ff',
        fillOpacity: 0.3,
        zIndex: 200,
        // 同 Polygon 的 Option 设置
      }
      mousetool.measureArea(options.areaStyle ? options.areaStyle : areaStyle)
      mousetool.on('draw', (event) => {
        console.log('测面积：', event)
        options.callback && options.callback()
      })
    })
  }

  /**
   *  @param {Object}
   *  - amap: 地图实例对象
   *  - num?:  点标记的次数 默认限制为： 最小为1，最大为100
   *  - callback?: 回调
   *  @description 绘制点标记
   */
  async drawPointMark(options) {
    if (!options.amap) {
      return console.warn('丢失地图实例')
    }
    try {
      const mouseTool = await this.makeMouseTool(options.amap)
      mouseTool.marker()
      mouseTool.on('draw', (event) => {
        if (!this.markResult) {
          this.markResult = new this.Gdmap.OverlayGroup()
          console.log(this.markResult)
        }
        // 限制绘制次数
        if (options?.num < 1) {
          options.num = 1
        } else if (options?.num > 100) {
          options.num = 100
        }
        const overlays = this.markResult.getOverlays()
        if (options?.num === 1 && overlays.length > 0) {
          options.amap.remove(overlays[0])
          this.markResult.removeOverlay(overlays[0])
        } else if (overlays.length > options.num - 1) {
          options.amap.remove(overlays[overlays.length - 1])
          this.markResult.removeOverlay(overlays[overlays.length - 1])
        }
        this.markResult.addOverlay(event.obj)
      })
    } catch (error) {
      console.log(error)
    }
  }

  /**
   *  @param {Object}
   *  - amap: 地图实例
   *  - polygonStyle?: 多边形样式
   *  - callback?: 回调
   *  @description 手动绘制多边形
   */
  async startDrawPolygon(options) {
    if (!options.amap) {
      return console.warn('没有地图对象')
    }
    const mousetool = await this.makeMouseTool(options.amap)
    const polygonStyle = {
      zIndex: 10,
      strokeColor: '#006600', // 线条颜色，使用16进制颜色代码赋值。默认值为#006600
      strokeOpacity: 0.9, // 轮廓线透明度，取值范围[0,1]，0表示完全透明，1表示不透明。默认为0.9
      strokeWeight: 2, // 轮廓线宽度
      fillColor: '#FFAA00', // 多边形填充颜色，使用16进制颜色代码赋值，如：#FFAA00
      fillOpacity: 0.9, // 多边形填充透明度，取值范围[0,1]，0表示完全透明，1表示不透明。默认为0.9
      draggable: false, // 设置多边形是否可拖拽移动，默认为false
      strokeStyle: 'solid', // 轮廓线样式，实线:solid，虚线:dashed
    }
    mousetool.polygon(options.polygonStyle ? options.polygonStyle : polygonStyle)
    mousetool.on('draw', (event) => {
      console.log('覆盖物对象绘制完成', event)
      options.callback && options.callback(event)
    })
  }

  /**
   *  @param {Object}
   *  - amap: 地图实例
   *  @description 编辑多边形
   */
  editPolygon(options) {
    if (!options.amap) {
      return console.warn('没有地图对象')
    }
  }
}
