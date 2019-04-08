class Die{
  constructor(note,sides){
    this._note = note
    this._sides = sides
    this._value = 0
    this.roll()
  }
  get note() {
    return this._note
  }
  get size() {
    return this._sides
  }
  get value() {
    return this._value
  }
  set value(value) {
    this._value = value
  }
  inValid(text) {
    this._value = text + this.value
  }
  roll() {
    this.value = Math.floor(Math.random() * (this.size) + 1)
  }
}

module.exports = Die;