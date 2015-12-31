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

function _getValue(){
  return this.value;
}
function _roll(){
  this.value = Math.floor(Math.random() * (sides) + 1);
}

module.exports = Die;