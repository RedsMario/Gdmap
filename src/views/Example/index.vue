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
        <el-divider content-position="left">绘制</el-divider>
        <el-button type="primary" size="mini" @click="startDrawPolygon" :disabled="isDisabled">绘制多边形</el-button>
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
    // 开始绘制多边形
    startDrawPolygon() {
      this.isDisabled = true
      this.GdAMap.startDrawPolygon({
        amap: this.amap,
        callback: () => {
          this.isDisabled = false
        },
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
