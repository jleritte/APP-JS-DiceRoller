var DicePool = require('./DicePool.js');
var Utils = require('./Utils.js');

// Working on turning into modules and will Reactify it ultimately
function Roller(){
  var _private = {
    'saved': localStorage.savedRolls ? JSON.parse(localStorage.savedRolls): {},
    'buildGUI': buildGUI,
    'loadStyles': loadStyles
  },
  utils = new Utils();

//Function that loads the saved rolls and fills the GUi
  function fillSaved(){
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
//Function to load the CSS
  function loadStyles(url){
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    var entry = document.getElementsByTagName('title')[0];
    entry.parentNode.insertBefore(link, entry);
  }
//Builds the pieces of the GUI and determines if the widget lives on the page by itself
  function buildGUI(where){
    where = !where?'body':'.'+where;
    if(where === 'body'){
      document.querySelector('title').innerHTML = 'Dice Roller';
      loadFavicon();
    }
    where = document.querySelector(where);
    loadTemplate(where);
    connectKey();
  }
//Loads the templates needed
  function loadTemplate(where){
    var templates = require('./templates'),
        keys = Object.keys(templates);

    keys.forEach(function(elem){
      var template = document.createElement('template');

      template.innerHTML = templates[elem].join("\n");
      if(elem === "game") {
        where.appendChild(document.importNode(template.content,true));
      } else {
        template.className = elem;
        where.appendChild(template);
      }
    });
    document.querySelector('input').addEventListener('focus',function(e){
      e.target.select();
    }); 
    connectButton(document.querySelector('.save'));
    fillSaved();
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
//Adds the Fovicon to the page if widget lives in the body
  function loadFavicon(){
    var icon = document.createElement('link');
    icon.rel = 'icon';
    icon.type = 'image/x-icon';
    icon.href = './img/favicon.ico';
    var entry = document.getElementsByTagName('title')[0];
    entry.parentNode.insertBefore(icon, entry);
  }
//Public functions
  Object.defineProperties(this,{
    'init': {
      value: _init.bind(_private),
      emunerable: true
    }
  });
}

window.Roller = Roller;

//Initalizer used to start the widget building process
function _init(where){
  this.loadStyles('css/roller.css');
  window.location.hash = 'roll';
  this.buildGUI(where);
}
