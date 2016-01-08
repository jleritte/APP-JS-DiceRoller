Roller = (function(me){
  var _private = me._private = me._private || {},
    _seal = me._seal = me._seal || function () {
      delete me._private;
      delete me._seal;
      delete me._unseal;
    },
    _unseal = me._unseal = me._unseal || function () {
      me._private = _private;
      me._seal = _seal;
      me._unseal = _unseal;
    };
    error = _private.error;
    saved = _private.saved;
    lib = _private.lib;
  lib.getResult = function(){
    var result = this.grabText();
    if(result !== error){
      dice = this.parseText(result);
      document.querySelector('.result').innerHTML = this.formatResult(dice);
      var clear = document.createElement('button');
      clear.textContent = 'Clear';
      clear.addEventListener('click',lib.clearResult);
      document.querySelector('.result').appendChild(clear);
    }
    else{
      document.querySelector('.result').innerHTML = result;
    }
  };
  lib.clearResult = function(){
    document.querySelector('.roll').value = '';
    document.querySelector('.result').innerHTML = '';
  };
  lib.saveRoll = function(){
    var mtch = false,where, save = lib.grabText();
    if(save !== error){
      var name = prompt("Enter Name For Roll",save);
      if(name === null) {
        return;
      }
      for(var roll in saved){
        if(saved[roll] === save){
          mtch = true;
          where = roll;
        }
      }
      if(!mtch){
        if(saved[name]) {
          mtch=true;
        }
        saved[name] = save;
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
    localStorage.savedRolls = JSON.stringify(saved);
    function deleteR(e) {
      lib.deleteRoll(e.target);
    }
    function fillI(e) {
      lib.fillInput(e.target);
    }
  };
  lib.deleteRoll = function(roll){
    var save = roll.parentElement.textContent;
    for(var rll in saved){
      if('x'+rll === save){
        delete saved[rll];
      }
    }
    roll.parentElement.parentElement.removeChild(roll.parentElement);
    localStorage.savedRolls = JSON.stringify(saved);
  };
  lib.formatResult = function(dice){
    var result = '';
    for(var die in dice){
      result += '<b>'+die+':</b> ';
      die = dice[die];
      if(Array.isArray(die)){
        for(i=0;i<die.length;i++){
          if(isNaN(die[i].value)){
            var num = die[i].value;
            num = num.substr(num.length-1);
            result += '<span class="disabled">'+num+'</span> ';
          }
          else{
            if(die[i].value === die[i].sides){
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
  };
  lib.grabText = function(){
    var roll = document.querySelector('.roll').value;
    var splt = roll.split('d');
    if(splt.length > 1){
      return roll;
    }
    return error;
  };

  return me;
})(Roller);