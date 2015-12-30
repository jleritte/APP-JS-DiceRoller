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
    lib.loadTemplate('js/roller.template.html',where);
    lib.connectKey();
    me._seal();
  };
  lib.loadTemplate = function(url,where){
    $(where).load(url,function(){
      $('input').click(function(){
        $(this).select();
      });
      lib.connectButton($('#save'));
      lib.fillSaved();
    });        
  };
  lib.connectKey = function(){
    $(window).keypress(function(e){
      if(e.keyCode === 13){
        lib.getResult();
      }
      else if(e.keyCode === 27){
        lib.clearResult($('#result'));
      }
      else if(e.keyCode === 112){
        console.log(e.keyCode);
        lib.toggleHelp();
      }
    });
  };
  lib.connectButton = function(butt){
    $(butt).click(function(){lib.saveRoll();});
  };
  lib.fillSaved = function(){
    for(var roll in saved){
      var li = $($('li.template').clone(true));
      $(li).find('span').click(deleteR);
      $('#saved')
        .append(
          $(li)
            .removeClass('template')
            .append(roll)
            .dblclick(fillI)
        );
    }
    function deleteR() {
      lib.deleteRoll(li);
    }
    function fillI() {
      lib.fillInput(this);
    }
  };
  lib.fillInput = function(roll){
    var str = $(roll).text();
    str = str.substring(1,str.length);
    $('#roll').val(saved[str]);
    this.getResult();
  };
  lib.toggleHelp = function(){
    if($('.help').length === 0){
      var help = $('div.template').clone();
      $('#roller').before(
        $(help).removeClass('template').addClass('help')
      );
    }
    else{
      $('.help').remove();
    }
  };
  lib.loadFavicon = function(){
    var icon = document.createElement('link');
    icon.rel = 'icon';
    icon.type = 'image/x-icon';
    icon.href = './img/favicon.ico';
    var entry = document.getElementsByTagName('script')[0];
    entry.parentNode.insertBefore(icon, entry);
  };

  return me;
})(Roller);