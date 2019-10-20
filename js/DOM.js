// DOM FUNCTIONS
let proto
class DOM {
  constructor() {
    console.log('DOM FUNCTIONS INIT')
    proto = Object.getPrototypeOf(this)
  }
  query(selector,context = document) {
    return copyProto({elements:context.querySelector(selector)})
  }
  queryAll(selector,context = document) {
    return copyProto({elements:[...context.querySelectorAll(selector)]})
  }
  add(content) {
    if(content){
      if(typeof content !== "object") {
        content = this.create(content)
      }
      this.elements.appendChild(content.elements)
      return this
    }
  }
  remove(content) {
    if(content) {
      this.elements.removeChild(content.elements)
      return this
    }
  }
  text(text) {
    this.elements.textContent = text
    return this
  }
  create(content) {
    let node = document.createElement('div')
    node.innerHTML = content
    return copyProto({elements: document.importNode(node.firstElementChild,true)})
  }
  css(url) {
    let link = document.createElement('link'),
      after = document.querySelector('title')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = url
    after.parentNode.insertBefore(link,after)
  }
  icon() {
    let link = document.createElement('link'),
      after = document.querySelector('title')
    link.rel = 'icon'
    link.type = 'image/x-icon'
    link.href = './img/favicon.ico'
    after.parentNode.insertBefore(link,after)
  }
}

function copyProto(newOb) {
  return Object.setPrototypeOf(newOb,proto)
}

export let $$ = new DOM()