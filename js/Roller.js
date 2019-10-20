// python -m SimpleHTTPServer 9001
// python -m http.server 9001

import DicePool from './DicePool.js'
import {ui,help,save} from './templates.js'
import {$$}from './DOM.js'

window.addEventListener('keyup',e => {
  if(e.which === 13) {
    console.log('enter hit')
    help($$.query('body'))
  }
})

class Roller {
  constructor() {
    let parent = $$.query('.rollContain')
    parent = parent.elements ? parent : $$.query('body')
    ui(parent)
    parent.add(save())
    // $$.css('css/roller.css')
  }
}

new Roller()
/*
// Working on turning into modules and will Reactify it ultimately
function Roller(){
  var _private = {
    'saved': localStorage.savedRolls ? JSON.parse(localStorage.savedRolls): {},
    'buildGUI': buildGUI,
    'loadStyles': loadStyles
  },
  utils = new Utils();

//Function that loads the saved rolls and fills the GUi
    var template = document.querySelector('template.save'),
        list = document.querySelector('ul.saved');
    for(var roll in _private.saved){
      var li = document.importNode(template.content,true);
      list.appendChild(li);
      li = list.lastElementChild;
      li.firstElementChild.addEventListener('click',deleteR);
      li.lastElementChild.textContent = roll;
      li.addEventListener('dblclick',fillI);
    }
    function deleteR(e) {
      utils.deleteRoll(e.target);
    }
    function fillI(e) {
      utils.fillInput(e.target);
    }
  }
//Adds the event listeners for different key strokes
  function connectKey(){
    document.addEventListener('keydown',function(e){
      if(e.which === 112){
        e.preventDefault();
      }
    });
    document.addEventListener('keyup',function(e){
      if(e.which === 13){
        utils.getResult();
      }
      else if(e.which === 27){
        utils.clearResult();
      }
      else if(e.which === 112){
        toggleHelp();
      }
    });
    document.querySelector('.roll').addEventListener('keyup',function(e){
      if(e.which === 57){
        autoParen(e.target);
      }
    });
  }
//Adds a closing parenthese to the end of the string
  function autoParen(input){
    var start = input.selectionStart,
        end = input.selectionEnd;
    input.value += ')';
    input.setSelectionRange(start,end);
  }
//adds the event listener for the save button
  function connectButton(butt){
    butt.addEventListener('click', function(){utils.saveRoll();});
  }
//Function that shows and removes the help screen
  function toggleHelp(){
    var contain = document.querySelector('.contain');
    if(document.querySelectorAll('.help').length === 1){
      var help = document.importNode(document.querySelector('template.help').content,true);
      contain.appendChild(help);
      help = document.querySelector('.helpBlur');
      help.className = 'helpBlur help';
    }
    else{
      contain.removeChild(contain.lastElementChild);
    }
  }
//Public functions
  Object.defineProperties(this,{
    'init': {
      value: _init.bind(_private),
      emunerable: true
    }
  });
}
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// OLD UTILS CODE
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

const ERROR = `Check Input`
let saved = localStorage.savedRolls ? JSON.parse(localStorage.savedRolls) : {}


//Function that validates the text
function validateText(text){
  return /d/.test(text)
  // let roll = document.querySelector('.roll').value;
  // var splt = roll.split('d');
  // if(splt.length > 1){
  //   return roll;
  // }
  // return _private.error;
}

//Function to get the Result from the inputed roll
function getResult(){
  let result = document.querySelector('.roll').value
  if(validateText(result)){
    let dice = new DicePool(result).pool

    document.querySelector('.result').innerHTML = _formatResult(dice);
    var clear = document.createElement('button');
    clear.textContent = 'Clear';
    clear.addEventListener('click',_clearResult);
    document.querySelector('.result').appendChild(clear);
  }
  else{
    document.querySelector('.result').textContent = ERROR
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
*/