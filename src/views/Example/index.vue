<template>
  <div class="example">
    <div class="views">
      <Gdmap class="amap" ref="amap" :containerStyle="containerStyle" @amapComplete="amapComplete" />
    </div>
    <div class="line"></div>
    <div class="opreation">
      <div class="opreation-item">
        <el-divider content-position="left">地图</el-divider>
        <el-button type="primary" size="mini" @click="switchTheme">切换主题</el-button>
      </div>
      <div class="opreation-item">
        <el-divider content-position="left">测量</el-divider>
        <el-button type="primary" size="mini" @click="startRanging" :disabled="isDisabled">测距</el-button>
        <el-button type="primary" size="mini" @click="startArea" :disabled="isDisabled">测面积</el-button>
      </div>
      <div class="opreation-item">
        <el-divider content-position="left">手动绘制</el-divider>
        <el-button type="primary" size="mini" @click="drawPolygonMark" :disabled="isDisabled">多边形</el-button>
        <el-button type="primary" size="mini" @click="drawPointMark" :disabled="isDisabled">点标记</el-button>
      </div>
      <div class="opreation-item">
        <el-divider content-position="left">数据绘制</el-divider>
        <el-button type="primary" size="mini" @click="drawPolygonByData" :disabled="isDisabled">多边形</el-button>
        <el-button type="primary" size="mini" @click="drawPointByData" :disabled="isDisabled">点标记</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import Gdmap from '@/components/Gdmap'
export default {
  components: {
    Gdmap,
  },
  data() {
    return {
      containerStyle: {
        width: '100%',
        height: '100%',
      },
      amap: null,
      GdAMap: null,
      isDisabled: false,
      theme: false,
    }
  },
  created() {},
  mounted() {},
  computed: {},
  watch: {},
  methods: {
    // 地图实例加载完成了
    amapComplete({ amap, GdAMap }) {
      this.amap = amap
      this.GdAMap = GdAMap
    },
    // 切换主题
    switchTheme() {
      this.isDisabled = true
      this.amap.destroy()
      this.$refs.amap.initGdMap({ theme: !this.theme, callback: () => (this.isDisabled = false) })
      this.theme = !this.theme
    },
    // 开始测距
    startRanging() {
      this.isDisabled = true
      this.GdAMap.mouseToolRanging({ amap: this.amap, callback: () => (this.isDisabled = false) })
    },
    // 开始测面积
    startArea() {
      this.isDisabled = true
      this.GdAMap.mouseToolArea({ amap: this.amap, callback: () => (this.isDisabled = false) })
    },
    // 创建多边形(有吸附)
    drawPolygonMark() {
      this.isDisabled = true
      this.GdAMap.drawPolygonMark({
        amap: this.amap,
        callback: ({ type, data }) => {
          console.log(type, data)
          this.isDisabled = false
        },
      })
    },
    // 创建点标记
    drawPointMark() {
      this.isDisabled = true
      this.GdAMap.drawPointMark({
        amap: this.amap,
        num: 2,
        callback: (mark, allMarkResult) => {
          const position = mark.getPosition()
          this.GdAMap.computedAddress([position.lng, position.lat]).then((address) => {
            console.log(address)
          })
          this.isDisabled = false
        },
      })
    },
    // 通过数据绘制多边形
    drawPolygonByData() {
      this.isDisabled = true
      // 模拟数据
      const data = [
        [108.944211, 34.262112],
        [108.951721, 34.262005],
        [108.942666, 34.258636],
        [108.950949, 34.258352],
        [108.952494, 34.260445],
      ]
      this.GdAMap.drawPolygonByData({
        amap: this.amap,
        data,
        callback: (polygon) => {
          this.isDisabled = false
          this.amap.setFitView(polygon)
          this.GdAMap.createPolygonEditor({ amap: this.amap })
          this.GdAMap.listenerPolygonEvent({ polygon }).then((polygonData) => {
            console.log('编辑后的多边形数据：', polygonData)
          })
        },
      })
    },
    // 通过数据绘制点标记
    drawPointByData() {
      this.isDisabled = true
      // 获取地图中心点
      const position = this.amap.getCenter()
      const data = []
      // 生成模拟坐标点
      for (let i = 0; i < 10; i++) {
        data.push({ lng: +(position.lng + i * 0.001).toFixed(6), lat: position.lat })
      }
      data.forEach((item) => {
        this.GdAMap.drawPointByData({
          amap: this.amap,
          data: item,
          callback: () => {
            this.isDisabled = false
          },
        })
      })
    },
  },
  destroyed() {},
}
</script>
<style lang="less" scoped>
.example {
  display: flex;
  .views {
    width: 50%;
    height: 100vh;
    .amap {
      /deep/ .amap-logo {
        display: none !important;
      }
      /deep/ .amap-copyright {
        display: none !important;
      }
    }
  }
  .line {
    width: 1px;
    height: 100vh;
    border-right: 1px solid #eee;
    margin-left: 20px;
    margin-right: 20px;
  }
  .opreation {
    flex: 1;
    padding-right: 20px;
  }
}
</style>
