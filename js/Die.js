//This is a die object that is used to create a die of any size
function Die(sides){
  var _private = {
    sides: sides,
    value: 0
  };

//Public Funtcions
  Object.defineProperties(this,{
    'getValue': {
      value: _getValue.bind(_private),
      emunerable: true
    },
    'getSize': {
      value: _getSize.bind(_private),
      emunerable: true
    },
    'inValid': {
      value: _inValid.bind(_private),
      emunerable: true
    },
    'setValue': {
      value: _setValue.bind(_private),
      emunerable: true
    },
    'roll': {
      value: _roll.bind(_private),
      emunerable: true
    }
  });
}

//Returns the current Value of the die
function _getValue(){
  return this.value;
}
//Returns the current Size of the die
function _getSize(){
  return this.sides;
}
//Appends Value to mark as not valid
function _inValid(text){
  this.value = text + this.value;
}
//Sets Value for special cases
function _setValue(value){
  this.value = value;
}
//Rolls the Die changing the value from 1 to # of sides
function _roll(){
  this.value = Math.floor(Math.random() * (this.sides) + 1);
}

module.exports = Die;