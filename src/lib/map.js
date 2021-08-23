import AMapLoader from '@amap/amap-jsapi-loader'

export default class GdMap {
  constructor() {
    // 加载完成的高德地图 与window.AMap相同
    this.AMap = null
    this.mouseTool = null
    this.markResult = null
    this.polyEditor = null
    this.polygonDrawing = []
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
        this.AMap = Gdmap
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
    const position = new this.AMap.LngLat(...options.lnglat)
    options.amap.setCenter(position)
  }

  /* ---------------------------------------------------- 鼠标工具 ---------------------------------- */
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
        this.mouseTool = new this.AMap.MouseTool(amap)
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
  /* ---------------------------------------------------- 绘制多边形 ---------------------------------- */

  /**
   *  @description 将其他坐标转换为高德坐标
   */
  createPath(data) {
    try {
      const path = []
      for (let i = 0; i < data.length; i++) {
        path.push([data[i][0], data[i][1]])
      }
      console.log(path)
      return path
    } catch (error) {
      throw new Error('转换高德坐标异常->>', error)
    }
  }

  /**
   *  @param {Object}
   *  - amap: 地图实例
   *  - data: 多边形路径 格式：二维数组 [[经度,纬度]]
   *  - customStyle: {Object} 多边形样式
   *  - callback: 绘制完成后的回调
   *  @description 通过数据绘制多边形
   */
  drawPolygonByData(options) {
    if (!options.amap) {
      return console.warn('没有地图对象')
    }
    try {
      const path = this.createPath(options.data)
      const defaultPolygonStyle = {
        map: options.amap,
        zIndex: 10,
        path: path,
        strokeColor: '#006600', // 线条颜色，使用16进制颜色代码赋值。默认值为#006600
        strokeOpacity: 0.9, // 轮廓线透明度，取值范围[0,1]，0表示完全透明，1表示不透明。默认为0.9
        strokeWeight: 2, // 轮廓线宽度
        fillColor: '#FFAA00', // 多边形填充颜色，使用16进制颜色代码赋值，如：#FFAA00
        fillOpacity: 0.9, // 多边形填充透明度，取值范围[0,1]，0表示完全透明，1表示不透明。默认为0.9
        draggable: false, // 设置多边形是否可拖拽移动，默认为false
        strokeStyle: 'solid', // 轮廓线样式，实线:solid，虚线:dashed
        ...options.customStyle,
      }
      const polygon = new this.AMap.Polygon(defaultPolygonStyle)
      options.callback && options.callback(polygon)
    } catch (error) {
      throw new Error('数据绘制多边形异常->>', error)
    }
  }

  /**
   *  @param {Object}
   *  - amap: 地图实例
   *  - data: {object} 点标记数据  {lng: 经度, lat: 纬度}
   *  @description 通过数据绘制点标记
   */
  drawPointByData(options) {
    try {
      if (!options.amap) {
        return console.warn('没有地图对象')
      }
      if (!options.data || !options.data.lng || !options.data.lat) {
        return console.warn('坐标不合法')
      }
      const mark = new this.AMap.Marker({
        map: options.amap,
        position: new this.AMap.LngLat(options.data.lng, options.data.lat),
      })
      options.callback && options.callback(mark)
    } catch (error) {
      throw new Error('数据绘制点标记异常->>>', error)
    }
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
          this.markResult = new this.AMap.OverlayGroup()
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
        options.callback && options.callback(event.obj, this.markResult)
      })
    } catch (error) {
      throw new Error('手动绘制点标记异常->>>', error)
    }
  }

  /**
   *  @description 绘制多边形
   */
  drawPolygonMark(options) {
    this.createPolygonEditor(options)
    this.polyEditor.setTarget()
    this.polyEditor.open()
    this.listenerPolyEditorEvent(options)
  }

  /**
   *  @param {Object}
   *  - amap: 地图实例
   *  - polygonStyle?: 多边形样式
   *  - callback?: 回调
   *  @description 手动绘制多边形
   */
  // async startDrawPolygon(options) {
  //   if (!options.amap) {
  //     return console.warn('没有地图对象')
  //   }
  //   const mousetool = await this.makeMouseTool(options.amap)
  //   const polygonStyle = {
  //     zIndex: 10,
  //     strokeColor: '#006600', // 线条颜色，使用16进制颜色代码赋值。默认值为#006600
  //     strokeOpacity: 0.9, // 轮廓线透明度，取值范围[0,1]，0表示完全透明，1表示不透明。默认为0.9
  //     strokeWeight: 2, // 轮廓线宽度
  //     fillColor: '#FFAA00', // 多边形填充颜色，使用16进制颜色代码赋值，如：#FFAA00
  //     fillOpacity: 0.9, // 多边形填充透明度，取值范围[0,1]，0表示完全透明，1表示不透明。默认为0.9
  //     draggable: false, // 设置多边形是否可拖拽移动，默认为false
  //     strokeStyle: 'solid', // 轮廓线样式，实线:solid，虚线:dashed
  //   }
  //   mousetool.polygon(options.polygonStyle ? options.polygonStyle : polygonStyle)
  //   mousetool.on('draw', (event) => {
  //     console.log('覆盖物对象绘制完成', event)
  //     const polygon = new this.AMap.Polygon({
  //       path: event.obj._opts.path,
  //     })
  //     options.callback && options.callback(polygon)
  //   })
  // }

  /**
   *  @param {Object}
   *  - amap: 地图实例
   *  - polygon: {Object} 多边形list
   *    - {path: []}
   *  - callback: 回调
   *  @description 创建可吸附的多边形
   */
  makePolygon(options) {
    if (!options.amap) {
      return console.warn('没有地图对象')
    }
    this.closePolygonEditor({ amap: options.amap, isClear: options.isClear })
    // 创建多边形编辑器
    this.createPolygonEditor(options)
    // (1) 如果传递了多边形list
    if (options.polygon && this.polygonDrawing.length === 0) {
      if (options.polygon instanceof Array) {
        for (let i = 0; i < options.polygon.length; i++) {
          const polygon = new this.AMap.Polygon({
            path: options.polygon[i].path,
          })
          this.polygonDrawing.push(polygon)
          options.amap.add(polygon)
          this.polyEditor.addAdsorbPolygons(polygon)
          this.listenerPolygonEvent({ ...options, polygon })
          this.drawPolygonMark()
        }
      }
    } else {
      // (2) 如果没有传递
      this.drawPolygonMark(options)
    }
  }

  /**
   *  @description 创建多边形编辑器实例
   */
  createPolygonEditor(options) {
    try {
      if (!options.amap) {
        return console.warn('没有地图对象')
      }
      if (this.polyEditor) {
        return this.polyEditor
      } else {
        const polyEditor = new this.AMap.PolygonEditor(options.amap)
        this.polyEditor = polyEditor
      }
    } catch (error) {
      throw new Error('创建多边形编辑器实例异常->>>', error)
    }
  }
  /* ---------------------------------------------------- 多边形事件监听 ---------------------------------- */

  /**
   *  @param {Object}
   *  - callback?: 事件结束后的回调
   *  @description 监听多边形编辑器事件
   */
  listenerPolyEditorEvent(options) {
    try {
      if (!this.polyEditor) {
        return console.warn('未初始化多边形编辑器')
      }
      this.polyEditor.on('add', (e) => {
        const polygon = e.target
        this.polyEditor.addAdsorbPolygons(polygon)
        this.listenerPolygonEvent({ ...options, polygon })
        options.callback && options.callback({ type: 'add', data: e })
      })
    } catch (error) {
      throw new Error('监听多边形编辑器异常->>>', error)
    }
  }

  /**
   *  @param {Object}
   * - polygon: 多边形对象
   *  @description 监听多边形的点击事件
   */
  listenerPolygonEvent(options) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.polyEditor) {
          return console.warn('未初始化多边形编辑器')
        }
        if (!options.polygon) {
          return console.warn('缺少多边形对象')
        }
        const polygon = options.polygon
        // 双击多边形进行编辑
        polygon.on('dblclick', () => {
          this.polyEditor.setTarget(polygon)
          this.polyEditor.open()
        })
        // 右击多边形取消编辑
        polygon.on('rightclick', (e) => {
          this.polyEditor.close()
          resolve(e)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   *  @param {Object}
   *  - amap: 地图实例
   *  - isClear?: {Boolean} 是否清除已存在的多边形
   *  @description 关闭多边形编辑器
   */
  closePolygonEditor(options) {
    if (!options.amap) {
      return console.warn('没有地图对象')
    }
    if (this.polyEditor && this.polyEditor?.className === 'PolygonEditor') {
      this.polyEditor.close()
      console.log(this.polyEditor.getTarget())
      // 关闭编辑器后是否移除已存在的多边形
      if (this.polyEditor.getTarget() && options.isClear) {
        options.amap.remove(this.polyEditor.getTarget())
      }
    }
  }

  /* ---------------------------------------------------- 计算操作 ---------------------------------- */
  /**
   *  @param {Array} 经纬度 [经度,纬度]
   *  @description 通过坐标计算当前详细地址
   */
  computedAddress(lnglat) {
    return new Promise((resolve, reject) => {
      const geocoder = new this.AMap.Geocoder()
      try {
        geocoder.getAddress(lnglat, (status, result) => {
          if (status === 'complete' && result.regeocode) {
            const address = result.regeocode.formattedAddress
            resolve(address)
          } else {
            throw new Error('根据经纬度查询地址失败')
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  }
}
