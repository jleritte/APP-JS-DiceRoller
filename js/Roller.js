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
  if(e.which === 27){
    clearResult()
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
let results, clear
//Function to get the Result from the inputed roll
function getResult(){
  let result = $$.query('.dr_roll').value,
      target = $$.query('.dr_result')
  if(validateText(result)){
    if($$.query('.dr_dice').elements) {
      clearResult()
    }
    let dice = new DicePool(result).pool
    results = formatResult(dice)
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
  // $$.query('.dr_roll').value = ''
  while(results.length) {
    $$.query('.dr_result').remove(results.pop())
  }
  $$.query('.dr_result').remove(clear)
}
//Function used to save a roll and add it to the saved list
function saveRoll(){
  let mtch = false, where, roll = $$.query('.dr_roll').value
  if(validateText(roll)){
    let name = prompt("Enter Name For Roll",roll);
    if(name === null) {
      return
    }
    for(let entry in saved){
      if(saved[entry] === roll){
        mtch = true
        where = entry
      }
    }
    if(!mtch){
      if(saved[name]) {
        mtch=true
      }
      saved[name] = roll
      if(!mtch){
        let list = $$.query('ul.dr_saved'),
            li = save(name, roll)
        list.add(li)
        $$.query('.dr_delete',li.elements).click = deleteR
        li.dblclick = fillI
      }
    }else{
      alert("Already saved as "+where)
    }
  }
  localStorage.savedRolls = JSON.stringify(saved);
  function deleteR(e) {
    console.log('click to delete')
    deleteRoll(e.target);
  }
  function fillI(e) {
    fillInput(e.target)
  }
}
//Function to delete roll and remove from the saved list
function deleteRoll(roll){
  let target = roll.previousElementSibling.textContent
  for(let rll in saved){
    if(rll === target){
      target = saved[rll]
      delete saved[rll]
    }
  }
  $$.query('.dr_saved').remove($$.query(`[title="${target}"]`))
  localStorage.savedRolls = JSON.stringify(saved);
}
//Function that formats the result for display in a human readable way
function formatResult(dice){
  let result = $$.query('.dr_result'),rows = []
  for(var die in dice){
    let row = $$.create('<span class="dr_row"></span>')
    row.add('<b>'+die+':</b> ')
    die = dice[die]
    if(Array.isArray(die)){
      for(let i=0;i<die.length;i++){
        if(isNaN(die[i].value)){
          var num = die[i].value
          num = num.replace(/[A-z]/g,'')
          row.add('<span class="dr_disabled">'+num+'</span> ')
        }
        else{
          if(die[i].value === die[i].size){
            row.add('<span class="dr_max">'+die[i].value+'</span> ')
          }
          else{
            row.add('<span>'+die[i].value+'</span> ')
          }
        }
      }
    }
    else{
      row.add('<span>'+die+'</span>')
    }
    result.add(row)
    rows.push(row)
  }
  return rows
}
//Function used to fill the Input from the saved list
function fillInput(roll){
  $$.query('.dr_roll').value = saved[roll.textContent]
  getResult()
}
