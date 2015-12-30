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
  lib.buildGUI = function(where){
    where = !where?'body':'.'+where;
    if(where === 'body'){
      lib.loadFavicon();
    }
    where = document.querySelector(where);
    lib.loadTemplate(where);
    lib.connectKey();
    me._seal();
  };
  lib.loadTemplate = function(where){
    var templates = {
  "game": ["<div id=\"contain\">",
      "<div id=\"roller\">",
        "<div>Type Roll below - Press F1 for Help</div>",
        "<input id=\"roll\" type=\"text\"></input>",
        "<button id=\"save\">Save</button>",
        "<div id=\"result\"></div>",
      "</div>",
      "<div id=\"list\">",
        "<div id=\"listCont\">",
          "<ul class=\"saved\"></ul>",
        "</div>",
      "</div>",
    "</div>"],
  "save": ["<li><span id=\"delete\">x</span></li>"],
  "help": ["<div id=\"helpBlur\">",
      "<pre id='helpContain'>",
"Drop Dice - v Number - Drops the lowest \"number\" of dice in a roll.",
"Keep Dice - ^ Number - Keeps the lowest \"numbers\" of dice in a roll.",
"Reroll Dice - r Number - Rerolls any dice that come up equal to or lower than \"number.\"",
"Exploding - ! - Adds an extra dice every time a die comes up as the maximum.",
"Success-Counting - t Number - Counts as successes the number of dice that land equal to or higher than \"number.\"",
"  Success-Canceling - c - Cancels out a success every time a die lands on \"1\" (the minimum).",
"  Bonus Successes - a - Adds a success every time a die lands on the maximum for that dice type.",
"Fate/Fudge dice - F - Rolls dice for the Fate system (-1, 0 or +1)</pre>",
    "</div>"]
},//require('./templates'),
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
    lib.connectButton(document.querySelector('#save'));
    lib.fillSaved();
  };
  lib.connectKey = function(){
    document.addEventListener('keypress',function(e){
      if(e.keyCode === 13){
        lib.getResult();
      }
      else if(e.keyCode === 27){
        lib.clearResult();
      }
      else if(e.keyCode === 112){
        console.log(e.keyCode);
        lib.toggleHelp();
      }
    });
  };
  lib.connectButton = function(butt){
    butt.addEventListener('click', lib.saveRoll);
  };
  lib.fillSaved = function(){
    var template = document.querySelector('template.save'),
        list = document.querySelector('ul.saved');
    for(var roll in saved){
      var li = document.importNode(template.content,true);
      list.appendChild(li);
      li = list.lastElementChild;
      li.firstElementChild.addEventListener('click',deleteR);
      li.appendChild(document.createTextNode(roll));
      li.addEventListener('dblclick',fillI);
    }
    function deleteR(e) {
      lib.deleteRoll(e.target);
    }
    function fillI(e) {
      lib.fillInput(e.target);
    }
  };
  lib.fillInput = function(roll){
    var str = roll.textContent;
    str = str.substring(1,str.length);
    document.querySelector('#roll').value = saved[str];
    this.getResult();
  };
  lib.toggleHelp = function(){
    if(document.querySelectorAll('.help').length === 1){
      var help = document.importNode(document.querySelector('template.help').content,true);
      window.contain.insertBefore(help,window.roller);
      help = window.contain.firstElementChild;
      help.className = 'help';
    }
    else{
      window.contain.removeChild(window.contain.firstElementChild);
    }
  };
  lib.loadFavicon = function(){
    var icon = document.createElement('link');
    icon.rel = 'icon';
    icon.type = 'image/x-icon';
    icon.href = './img/favicon.ico';
    var entry = document.getElementsByTagName('title')[0];
    entry.parentNode.insertBefore(icon, entry);
  };

  return me;
})(Roller);