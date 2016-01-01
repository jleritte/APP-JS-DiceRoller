//This is a die object that is used to create a die of any size
function Die(sides){
  var _private = {
    sides: sides,
    value: 0
  };

  Object.defineProperties(this,{
    'getValue': {
      value: _getValue.bind(_private),
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
//Rolls the Die changing the value from 1 to # of sides
function _roll(){
  this.value = Math.floor(Math.random() * (sides) + 1);
}

module.exports = Die;