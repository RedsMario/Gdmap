<template>
  <div class="Gd-map" id="GdMap" :style="containerStyle"></div>
</template>

<script>
import GdMap from '@/lib/map.js'
import { isHTMLElement } from '@/lib/utils.js'
export default {
  props: {
    containerStyle: {
      type: Object,
      default: function () {
        return {
          width: '100%',
          height: '100%',
          background: 'pink',
        }
      },
    },
    AMapConfig: {
      type: Object,
      require: true,
      default: function () {
        return {
          key: 'a4f2a8e85eadf27b6711fac907827984',
          version: '2.0',
          AMapUI: {
            // 是否加载 AMapUI，缺省不加载
            version: '1.1', // AMapUI 缺省 1.1
            plugins: [], // Array需要加载的 AMapUI ui插件
          },
          plugins: [
            'AMap.DistrictSearch',
            'AMap.Autocomplete',
            'AMap.MouseTool',
            'AMap.CircleEditor',
            'AMap.PolygonEditor',
            'AMap.Geocoder',
            'AMap.ElasticMarker',
            'AMap.Map3D',
            'AMap.GraspRoad',
            'AMap.Driving',
            'AMap.Walking',
            'AMap.Riding',
            'AMap.TruckDriving',
            'AMap.Transfer',
            'AMap.Geolocation',
          ],
        }
      },
    },
    id: {
      type: [String, Object],
      require: true,
      default: 'GdMap',
    },
  },
  components: {},
  data() {
    return {
      amap: null,
      GdAMap: null,
    }
  },
  created() {
    this.handleCustomStyle()
  },
  mounted() {
    this.initGdMap()
  },
  computed: {},
  watch: {},
  methods: {
    async initGdMap(options) {
      // 初始化实例对象
      const GdAMap = new GdMap()
      // 调用实例对象的LoaderMap方法来加载地图
      const AMap = await GdAMap.LoaderMap(this.AMapConfig)
      // 创建地图实例
      const amap = new AMap.Map(this.isDom(), {
        zoom: 16,
        viewMode: '3D',
        mapStyle: options && options.theme && 'amap://styles/991ebfd7ce0f6df634d051219ce65551',
      })
      amap.setFitView()
      this.commissioning(amap)
      this.GdAMap = GdAMap
      this.amap = amap
      // 地图实例加载完成
      amap.on('complete', () => {
        this.$emit('amapComplete', { amap, GdAMap })
        if (options && options.callback) {
          options.callback()
        }
      })
    },
    // 开发调试时使用
    commissioning(amap) {
      // 只在开发环境下打开
      window.amap = process.env.NODE_ENV === 'development' ? amap : null
    },
    /**
     *  @description 判断是否为Dom
     */
    isDom() {
      return isHTMLElement(this.id) ? isHTMLElement(this.id) : this.id
    },
    /**
     *  @description 处理宽和高
     */
    handleCustomStyle() {
      Object.keys(this.containerStyle).forEach((itemStyle) => {
        if (['width', 'height'].includes(itemStyle) && typeof this.containerStyle[itemStyle] !== 'string') {
          this.containerStyle[itemStyle] = `${this.containerStyle[itemStyle]}px`
        }
      })
    },
  },
  beforeDestroy() {
    this.amap.destroy()
  },
  destroyed() {},
}
</script>
<style lang="less" scoped></style>
