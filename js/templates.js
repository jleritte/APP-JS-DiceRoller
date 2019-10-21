import {$$} from './DOM.js'

//HTML Templates in string format
let uiContent = ["<div class=\"contain\">",
  "<div class=\"list content\" tabindex=\"1\">",
    "<div class=\"tab\">Saves</div>",
    "<div class=\"listCont\">",
      "<ul class=\"saved\"></ul>",
    "</div>",
  "</div>",
  "<div class=\"roller content\" tabindex=\"1\">",
    "<div class=\"tab\">Rolls</div>",
    "<input class=\"roll\" type=\"text\" value=\"d%+4dF+5d8+4-2+6d12r3v2^4!6\"></input>",
    "<input class=\"save\" type=\"button\" value=\"Save\"></input>",
    "<div class=\"result\"></div>",
  "</div>",
  "<div class=\"usage\">",
    "<p>Type Roll below - Hit Enter to roll</p>",
    "<p>Press F1 to toggle Help</p>",
  "</div>",
"</div>"].join(''),
  saveContent = ["<li><span class=\"delete\">X</span><span></span></li>"].join(''),
  helpContent = ["<div class=\"helpBlur\">",
      "<div class='helpContain'>",
        "<ul>",
          "<li>Standard Notation is <b>NdX</b>. It can be chained <b>NdX+NdX</b>. Empty <b>N</b> will counts as an 1.</li>",
          "<li>eg. <b>4d6</b> will roll 4 6-sided dice and <b>d6</b> will roll just 1.</li>",
          "<li><i>Precentile dice</i> - <b>d%</b> - Rolls 2d10 dice converting them to values between 1 and 100</li>",
          "<li><i>Fate/Fudge dice</i> - <b>NdF</b> - Rolls dice for the Fate system (-1, 0 or +1)</li>",
          // "<li><i>Feng Shui shorthand</i> - <b>dFS</b> - same as d6!-d6!</li>",
          "<li>Roll modifiers only effect the die type they follow unless parentheses are used.</li>",
          "<li><i>Drop Dice</i> - <b>v[Number]</b> - Drops the lowest \"number\" of dice in a roll.</li>",
          "<li><i>Keep Dice</i> - <b>^[Number]</b> - Keeps the lowest \"number\" of dice in a roll.</li>",
          "<li><i>Reroll Dice</i> - <b>r[Number]</b> - Rerolls any dice that come up equal to or lower than \"number.\"</li>",
          "<li><i>Exploding</i> - <b>![Number]</b> - Adds an extra dice every time a die comes up as the \"number\" or higher.</li>",
          "<li><i>Success-Counting</i> - <b>t[Number]</b> - Counts as successes the number of dice that land equal to or higher than \"number.\"</li>",
          "<li><ul>",
            "<li><i>  Success-Canceling</i> - <b>c</b> - Cancels out a success every time a die lands on \"1\" (the minimum).</li>",
            "<li><i>  Bonus Successes</i> - <b>a</b> - Adds a success every time a die lands on the maximum for that dice type.</li>",
          "</ul></li>",
        "</ul>",
      "</div>",
    "</div>"].join('')

// Functions to convert Templates HTML
export function ui(parent) {
  if(!parent) return
  let uiele = $$.create(uiContent)
  parent.add(uiele)
  // if(parent.elements === document.body) {
  //   $$.query('title').text('Dice Roller')
  //   $$.icon()
  // }
}

export function save() {
  return $$.create(saveContent)
}

let helpVisable = 0, helpele = $$.create(helpContent)
export function help(parent) {
  if(!parent) return
  console.log(parent.elements,helpele.elements)
  if(parent.elements.clientHeight < 100)
    console.log("tacos")
  helpVisable = !helpVisable
  helpVisable ? parent.add(helpele) : parent.remove(helpele)
}
