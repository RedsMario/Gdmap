/**
 *  @param {any}
 *  @return {Boolean}
 *  @description 是否为Dom元素
 */
export const isHTMLElement = (ele) => {
  return typeof HTMLElement === 'object' ? ele instanceof HTMLElement : !!(ele && typeof ele === 'object' && (ele.nodeType === 1 || ele.nodeType === 9) && typeof ele.nodeName === 'string')
}
