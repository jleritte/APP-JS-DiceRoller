var Die = require('./Die.js');

function DicePool(text){
  var _private = {
    dice: parseText(text)
  };

}

module.exports = DicePool;