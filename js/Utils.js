var DicePool = require('./DicePool.js');

//This is a object to hold util functions
function utils(saved){
  var _private = {
    error: 'Check Input',
    saved: saved
  };

//Public functions
  Object.defineProperties(this,{
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

//Function to get the Result for 
function _getResult(){
  var result = _grabText();
  if(result !== this.error){
    dice = new DicePool(result);
    dice = dice.getPool();
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
function _clearResult(){
  document.querySelector('.roll').value = '';
  document.querySelector('.result').innerHTML = '';
}
function _saveRoll(){
  var mtch = false, where, save = _grabText();
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
    li.appendChild(document.createTextNode(name));
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
function _formatResult(dice){
  var result = '';
  for(var die in dice){
    result += '<b>'+die+':</b> ';
    die = dice[die];
    if(Array.isArray(die)){
      for(i=0;i<die.length;i++){
        if(isNaN(die[i].getValue())){
          var num = die[i].getValue();
          num = num.substr(num.length-1);
          result += '<span class="disabled">'+num+'</span> ';
        }
        else{
          if(die[i].getValue() === die[i].getSize()){
            result += '<span class="max">'+die[i].getValue()+'</span> ';
          }
          else{
            result += '<span>'+die[i].getValue()+'</span> ';
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
function _grabText(){
  var roll = document.querySelector('.roll').value;
  var splt = roll.split('d');
  if(splt.length > 1){
    return roll;
  }
  return this.error;
}
function _fillInput(roll){
  var str = roll.textContent;
  str = str.substring(1,str.length);
  document.querySelector('.roll').value = this.saved[str];
  _getResult();
}

module.exports = utils;