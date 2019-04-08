var DicePool = require('./DicePool.js');

//This is a object to hold util functions
function utils(){
  var _private = {
    'error': 'Check Input',
    'saved': localStorage.savedRolls ? JSON.parse(localStorage.savedRolls): {},
    'grabText': _grabText,
    'getResult': _getResult
  };

//Function the grobs and validates the text
  function _grabText(){
    var roll = document.querySelector('.roll').value;
    var splt = roll.split('d');
    if(splt.length > 1){
      return roll;
    }
    return _private.error;
  }

//Public functions
  Object.defineProperties(this,{
    private: _private,
    'getResult': {
      value: _getResult.bind(_private),
      emunerable: true
    },
    'clearResult': {
      value: _clearResult.bind(_private),
      emunerable: true
    },
    'saveRoll': {
      value: _saveRoll.bind(_private),
      emunerable: true
    },
    'deleteRoll': {
      value: _deleteRoll.bind(_private),
      emunerable: true
    },
    'formatResult': {
      value: _formatResult.bind(_private),
      emunerable: true
    },
    'grabtext': {
      value: _grabText.bind(_private),
      emunerable: true
    },
    'fillInput': {
      value: _fillInput.bind(_private),
      emunerable: true
    }
  });
}

//Function to get the Result from the inputed roll
function _getResult(){
  var result = this.grabText(),dice;
  if(result !== this.error){
    dice = new DicePool(result);
    dice = dice.pool;
    document.querySelector('.result').innerHTML = _formatResult(dice);
    var clear = document.createElement('button');
    clear.textContent = 'Clear';
    clear.addEventListener('click',_clearResult);
    document.querySelector('.result').appendChild(clear);
  }
  else{
    document.querySelector('.result').innerHTML = result;
  }
}
//Function to clear the result contents
function _clearResult(){
  document.querySelector('.roll').value = '';
  document.querySelector('.result').innerHTML = '';
}
//Function used to save a roll and add it to the saved list
function _saveRoll(){
  var mtch = false, where, save = this.grabText();
  if(save !== this.error){
    var name = prompt("Enter Name For Roll",save);
    if(name === null) {
      return;
    }
    for(var roll in this.saved){
      if(this.saved[roll] === save){
        mtch = true;
        where = roll;
      }
    }
    if(!mtch){
      if(this.saved[name]) {
        mtch=true;
      }
      this.saved[name] = save;
      if(!mtch){
      var template = document.querySelector('template.save'),
          list = document.querySelector('ul.saved'),
          li = document.importNode(template.content,true);
    list.appendChild(li);
    li = list.lastElementChild;
    li.firstElementChild.addEventListener('click',deleteR);
    li.lastElementChild.textContent = name;
    li.addEventListener('dblclick',fillI);
      }
    }else{
      alert("Already saved as "+where);
    }
  }
  localStorage.savedRolls = JSON.stringify(this.saved);
  function deleteR(e) {
    _deleteRoll(e.target);
  }
  function fillI(e) {
    _fillInput(e.target);
  }
}
//Function to delete roll and remove from the saved list
function _deleteRoll(roll){
  var save = roll.parentElement.textContent;
  for(var rll in this.saved){
    if('x'+rll === save){
      delete this.saved[rll];
    }
  }
  roll.parentElement.parentElement.removeChild(roll.parentElement);
  localStorage.savedRolls = JSON.stringify(this.saved);
}
//Function that formats the result for display in a human readable way
function _formatResult(dice){
  var result = '';
  for(var die in dice){
    result += '<b>'+die+':</b> ';
    die = dice[die];
    if(Array.isArray(die)){
      for(let i=0;i<die.length;i++){
        if(isNaN(die[i].value)){
          var num = die[i].value;
          num = num.replace(/[A-z]/g,'');
          result += '<span class="disabled">'+num+'</span> ';
        }
        else{
          if(die[i].value === die[i].size){
            result += '<span class="max">'+die[i].value+'</span> ';
          }
          else{
            result += '<span>'+die[i].value+'</span> ';
          }
        }
      }
    }
    else{
      result += die;
    }
    result += '</br>';
  }
  return result;
}
//Function used to fill the Input from the saved list
function _fillInput(roll){
  var str = roll.textContent;
  document.querySelector('.roll').value = this.saved[str];
  window.location.hash = 'roll';
  this.getResult();
}

module.exports = utils;