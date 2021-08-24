export default {
  install(Vue) {
    Vue.prototype.$log = this.log
  },
  log(info, color) {
    return console.log(`%c${info}`, `color: ${color}`)
  },
}
