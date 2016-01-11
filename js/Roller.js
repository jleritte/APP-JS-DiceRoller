var DicePool = require('./DicePool.js');
var utils = require('./Utils.js');

// Working on turning into modules and will Reactify it ultimately
function Roller(){
  var _private = {
    'saved': localStorage.savedRolls ? JSON.parse(localStorage.savedRolls): {},
    'buildGUI': buildGUI,
    'loadStyles': loadStyles
  };

  utils = new utils(_private.saved);

  function fillSaved(){
    var template = document.querySelector('template.save'),
        list = document.querySelector('ul.saved');
    for(var roll in _private.saved){
      var li = document.importNode(template.content,true);
      list.appendChild(li);
      li = list.lastElementChild;
      li.firstElementChild.addEventListener('click',deleteR);
      li.appendChild(document.createTextNode(roll));
      li.addEventListener('dblclick',fillI);
    }
    function deleteR(e) {
      utils.deleteRoll(e.target);
    }
    function fillI(e) {
      utils.fillInput(e.target);
    }
  }
  function loadStyles(url){
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    var entry = document.getElementsByTagName('title')[0];
    entry.parentNode.insertBefore(link, entry);
  }
  function buildGUI(where){
    where = !where?'body':'.'+where;
    if(where === 'body'){
      loadFavicon();
    }
    where = document.querySelector(where);
    loadTemplate(where);
    connectKey();
  }
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
  function connectKey(){
    document.addEventListener('keyup',function(e){
      if(e.key === "Enter"){
        utils.getResult();
      }
      else if(e.key === "Escape"){
        utils.clearResult();
      }
      else if(e.key === "F1"){
        toggleHelp();
      }
    });
    document.querySelector('.roll').addEventListener('keyup',function(e){
      if(e.key === "("){
        autoParen(e.target);
      }
    });
  }
  function autoParen(input){
    var start = input.selectionStart,
        end = input.selectionEnd;
    input.value += ')';
    input.setSelectionRange(start,end);
  }
  function connectButton(butt){
    butt.addEventListener('click', function(){utils.saveRoll();});
  }
  function toggleHelp(){
    if(document.querySelectorAll('.help').length === 1){
      var help = document.importNode(document.querySelector('template.help').content,true);
      document.querySelector('.contain').insertBefore(help,document.querySelector('.roller'));
      help = document.querySelector('.contain').firstElementChild;
      help.className = 'helpBlur help';
    }
    else{
      document.querySelector('.contain').removeChild(document.querySelector('.contain').firstElementChild);
    }
  }
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

function _init(where){
  this.loadStyles('css/roller.css');
  this.buildGUI(where);
}
