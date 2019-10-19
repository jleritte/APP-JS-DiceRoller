console.log("UTILS LOADED")
// DOM FUNCTIONS
let proto
export class DOM {
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
    return copyProto({elements: document.importNode(node,true)})
  }
  css(url) {
    console.log(url)
    let link = document.createElement('link'),
      after = document.querySelector('title')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = url
    after.parentNode.insertBefore(link,after)
  }
}

function copyProto(newOb) {
  return Object.setPrototypeOf(newOb,proto)
}