// python -m SimpleHTTPServer 9001
// python -m http.server 9001

import DicePool from './DicePool.js'
import {ui,help,save} from './templates.js'
import {$$}from './DOM.js'

let parent = $$.query('.rollContain').elements ? $$.query('.rollContain') : $$.query('body')
class Roller {
  constructor() {
    $$.css('css/roller.css')
    // parent.add(save())
    ui(parent)
  }
}

new Roller()

window.addEventListener('keyup',e => {
  if(e.which === 112) {
    help($$.query('.dr_contain'))
  }
  if(e.which === 13){
    getResult()
  }
})
window.addEventListener('keydown',function(e){
  if(e.which === 112){
    e.preventDefault();
  }
});

$$.query('.dr_rollButton').click = getResult
$$.query('.dr_saveButton').click = saveRoll


// REMOVE THIS CODE %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  let widget = true,
      wContain = $$.query('.rollContain'),
      body = $$.query('body')
  button.onclick = _ => {
    let app = $$.query('.dr_contain')
    if(widget) {
      body.add(app)
      wContain.elements.style.display = 'none'
    } else {
      wContain.add(app)
      wContain.elements.style.display = 'block'
    }
    widget = !widget
  }
// REMOVE THIS CODE %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


// Working on turning into modules and will Reactify it ultimately
// function Roller(){
//   var private = {
//     'saved': localStorage.savedRolls ? JSON.parse(localStorage.savedRolls): {},
//     'buildGUI': buildGUI,
//     'loadStyles': loadStyles
//   },
//   utils = new Utils();

// //Function that loads the saved rolls and fills the GUi
//     var template = document.querySelector('template.save'),
//         list = document.querySelector('ul.saved');
//     for(var roll in private.saved){
//       var li = document.importNode(template.content,true);
//       list.appendChild(li);
//       li = list.lastElementChild;
//       li.firstElementChild.addEventListener('click',deleteR);
//       li.lastElementChild.textContent = roll;
//       li.addEventListener('dblclick',fillI);
//     }
//     function deleteR(e) {
//       utils.deleteRoll(e.target);
//     }
//     function fillI(e) {
//       utils.fillInput(e.target);
//     }
//   }
// //Adds the event listeners for different key strokes
//   function connectKey(){
//     document.addEventListener('keydown',function(e){
//       if(e.which === 112){
//         e.preventDefault();
//       }
//     });
//     document.addEventListener('keyup',function(e){
//       if(e.which === 13){
//         utils.getResult();
//       }
//       else if(e.which === 27){
//         utils.clearResult();
//       }
//       else if(e.which === 112){
//         toggleHelp();
//       }
//     });
//     document.querySelector('.roll').addEventListener('keyup',function(e){
//       if(e.which === 57){
//         autoParen(e.target);
//       }
//     });
//   }
// //Adds a closing parenthese to the end of the string
//   function autoParen(input){
//     var start = input.selectionStart,
//         end = input.selectionEnd;
//     input.value += ')';
//     input.setSelectionRange(start,end);
//   }
// //adds the event listener for the save button
//   function connectButton(butt){
//     butt.addEventListener('click', function(){utils.saveRoll();});
//   }
// //Public functions
//   Object.defineProperties(this,{
//     'init': {
//       value: init.bind(_private),
//       emunerable: true
//     }
//   });
// }
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
  // return private.error;
}
let resultele, clear
//Function to get the Result from the inputed roll
function getResult(){
  let result = $$.query('.dr_roll').value,
      target = $$.query('.dr_result')
  if(validateText(result)){
    if($$.query('.dr_dice').elements) {
      clearResult()
    }
    let dice = new DicePool(result).pool
    resultele = formatResult(dice)
    target.add(resultele)
    clear = $$.create('<input type="button" value="Clear"/>');
    clear.click = clearResult
    target.add(clear)
  }
  else{
    target.text = ERROR
  }
}

//Function to clear the result contents
function clearResult(){
  // document.querySelector('.roll').value = '';
  $$.query('.dr_result').remove(resultele)
  $$.query('.dr_result').remove(clear)
}
//Function used to save a roll and add it to the saved list
function saveRoll(){
  var mtch = false, where, save = $$.query('.dr_roll').value
  if(validateText(save)){
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

        // TODO: Continue here
        let template = document.querySelector('template.save'),
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
  localStorage.savedRolls = JSON.stringify(saved);
  function deleteR(e) {
    deleteRoll(e.target);
  }
  function fillI(e) {
    fillInput(e.target);
  }
}
//Function to delete roll and remove from the saved list
function deleteRoll(roll){
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
function formatResult(dice){
  let result = $$.create('<span class="dr_dice"></span>')
  for(var die in dice){
    result.add('<b>'+die+':</b> ')
    die = dice[die]
    if(Array.isArray(die)){
      for(let i=0;i<die.length;i++){
        if(isNaN(die[i].value)){
          var num = die[i].value
          num = num.replace(/[A-z]/g,'')
          result.add('<span class="dr_disabled">'+num+'</span> ')
        }
        else{
          if(die[i].value === die[i].size){
            result.add('<span class="dr_max">'+die[i].value+'</span> ')
          }
          else{
            result.add('<span>'+die[i].value+'</span> ')
          }
        }
      }
    }
    else{
      result.add('<span>'+die+'</span>')
    }
    result.add('</br>')
  }
  return result
}
//Function used to fill the Input from the saved list
function fillInput(roll){
  var str = roll.textContent;
  document.querySelector('.roll').value = this.saved[str];
  window.location.hash = 'roll';
  this.getResult();
}
