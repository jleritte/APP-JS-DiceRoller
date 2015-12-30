Roller = {
  loadStyles:function(url){
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    var entry = document.getElementsByTagName('script')[0];
    entry.parentNode.insertBefore(link, entry);
  },
  loadScript:function(url, callback){
    var script = document.createElement('script');
    script.async = true;
    script.src = url;
    var entry = document.getElementsByTagName('script')[0];
    entry.parentNode.insertBefore(script, entry);
    script.onload = script.onreadystatechange = function()
    {
      var rdyState = script.readyState;
      if (!rdyState || /complete|loaded/.test(script.readyState))
      {
        callback();
        script.onload = null;
        script.onreadystatechange = null;
      }
    };
  },
  loadFavicon:function(){
    var icon = document.createElement('link');
    icon.rel = 'shortcut icon';
    icon.href = './img/favicon.ico';
    var entry = document.getElementsByTagName('script')[0];
    entry.parentNode.insertBefore(icon, entry);
  },
  init:function(where){
    this.loadStyles('./css/roller.css');
    this.loadScript('http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js',function(where){
          Roller.buildGUI(where);
    });
  },
  loadTemplate:function(url,where){
    $(where).load(url,function(){
      $('input').click(function(){
        $(this).select();
      });
      Roller.connectButton($('#save'));
      Roller.fillSaved();
    });
    
  },
  buildGUI:function(where){
    where = !where?'body':'.'+where;
    if(where === 'body'){
      this.loadFavicon();
    }
    this.loadTemplate('js/roller.template.html',where);
    this.connectKey();
    //this.connectButton($('#save'));
    //this.fillSaved();
  },
  connectKey:function(){
    $(window).keypress(function(e){
      if(e.keyCode == 13){
        Roller.getResult();
      }
      else if(e.keyCode == 27){
        Roller.clearResult($('#result'));
      }
      else if(e.keyCode == 112){
        console.log(e.keyCode);
        Roller.toggleHelp();
      }
    });
  },
  connectButton:function(butt){
    $(butt).click(function(){Roller.saveRoll();});
  },
  fillSaved:function(){
    if(!localStorage.savedRolls) return;
    this.saved = JSON.parse(localStorage.savedRolls);
    for(var roll in this.saved){
      var li = $($('li.template').clone(true));
      $('#saved')
        .append(
          $(li)
            .removeClass('template')
            .append(roll)
            .dblclick(function(){
              Roller.fillInput(this);
            })
        );
    }
  },
  fillInput:function(roll){
    var str = $(roll).text();
    str = str.substring(1,str.length);
    $('#roll').val(this.saved[str]);
    this.getResult();
  },
  toggleHelp:function(){
    if($('.help').length === 0){
      var help = $('div.template').clone();
      $('#roller').before(
        $(help).removeClass('template').addClass('help')
      );
    }
    else{
      $('.help').remove();
    }
  },
  deleteRoll:function(roll){
    var save = $(roll).parent().text();
    for(var rll in this.saved){
      if('x'+rll == save){
        delete this.saved[rll];
      }
    }
    $(roll).parent().remove();
    localStorage.savedRolls = JSON.stringify(this.saved);
  },
  getResult:function(){
    var result = this.grabText();
    if(result !== this.error){
      dice = this.parseText(result);
      this.processAdders(dice);
      //console.log(dice);
      $('#result').html(this.formatResult(dice));
      var clear = document.createElement('button');
      $('#result')
        .append(
          $(clear)
            .text('Clear')
            .click(function(){
              Roller.clearResult($(this).parent());
            })
        );
    }
    else{
      $('#result').text(result);
    }
  },
  clearResult:function(div){
    $('input').val('');
    div.empty();
  },
  grabText:function(){
    var roll = $('#roll').val();
    var splt = roll.split('d');
    if(splt.length > 1){
      return roll;
    }
    return this.error;
  },
  parseText:function(roll){
    var dice = {};
    roll = roll.split(/([+v^r!act])/);
    //console.log(roll);
    if(roll.length == 1){
      temp = this.getDice(roll[0]);
      dice[roll[0]] = this.rollDice(roll[0],temp);
    }
    else{
      for(var i = 0;i < roll.length;i+=2){
        temp = this.getDice(roll[i]);
        if(Array.isArray(temp)){
          dice[roll[i]] = this.rollDice(roll[i],temp);
        }
        else{
          dice[roll[i-1]] = temp;
        }
      }
    }
    if(!dice.hasOwnProperty('+')){
      dice['+'] = 0;
    }
    return dice;
  },
  getDice:function(note){
    var num,sides,dice =[];
    if(/\d*d\d+/.test(note)){
      roll = note.split('d');
      num = isNaN(parseInt(roll[0],10))?1:parseInt(roll[0],10);
      sides = parseInt(roll[1],10);
    }
    else if(/\d*d%/.test(note)){
      num = 2;
      sides = 10;
    }
    else if(/\d*dF/.test(note)){
      roll = note.split('d');
      num = isNaN(parseInt(roll[0],10))?1:parseInt(roll[0],10);
      sides = 6;
    }
    else{
      return note;
    }
    while(dice.length < num){
      dice.push(new this.die(sides));
    }
    return dice;
  },
  rollDice:function(note,dice){
    for(var i = 0; i < dice.length; i++){
      dice[i].roll();
    }
    if(/\d*d%/.test(note)){
      var prcnt = 0;
      for(i = 0; i < dice.length; i++){
        dice[i].value -= 1;
      }
      dice[0].value *= 10;
      for(i = 0; i < dice.length; i++){
        prcnt += dice[i].value;
      }
      if(prcnt === 0){
        prcnt = 100;
      }
      dice = prcnt;
    }
    else if(/\d*dF/.test(note)){
      var total = 0;
      for(i = 0; i < dice.length; i++){
        var tmp = dice[i].value;
        if(tmp == 2||tmp == 3){
          dice[i].value = -1;
        }
        else if(tmp == 4||tmp == 6){
          dice[i].value = 0;
        }
        else if(tmp == 1||tmp == 5){
          dice[i].value = 1;
        }
        total += dice[i].value;
      }
      dice = total;
    }
    return dice;
  },
  processAdders:function(dice){
    if(dice.hasOwnProperty('r')){
      this.reRollDice(dice,dice['r']);
      delete dice['r'];
    }
    if(dice.hasOwnProperty('!')){
      this.explodeRoll(dice,dice['!']);
      delete dice['!'];
    }
    if(dice.hasOwnProperty('v')){
      this.dropLowest(dice,dice['v']);
      delete dice['v'];
    }
    if(dice.hasOwnProperty('^')){
      this.keepLowest(dice,dice['^']);
      delete dice['^'];
    }
    if(dice.hasOwnProperty('t')){
      this.countSuccess(dice,dice['t']);
      delete dice['t'];
    }
    if(dice.hasOwnProperty('+')){
      this.getTotal(dice,dice['+']);
      delete dice['+'];
    }
  },
  reRollDice:function(dice,limit){
    limit = isNaN(parseInt(limit))?1:parseInt(limit);
    for(var key in dice){
      var pool = dice[key];
      if(Array.isArray(pool)){
        var cnt = 0,
          size = pool[0].sides;
        while(true){
          if(limit == size){
            break;
          }
          if(cnt >= pool.length){
            break;
          }
          if(pool[cnt].value <= limit){
            var tmp = new this.die(size);
            tmp.roll();
            pool[cnt].value = 'r'+pool[cnt].value;
            pool.splice(cnt+1,0,tmp);
          }
          cnt++;
        }
      }
    }
  },
  explodeRoll:function(dice,limit){
    limit = isNaN(parseInt(limit))?-1:parseInt(limit);
    var expld = 0;
    for(var key in dice){
      var pool = dice[key];
      if(Array.isArray(pool)){
        var cnt = 0,
          size = pool[0].sides,
          bns = limit == -1?size:limit;
        while(true){
          if(cnt >= pool.length){
            break;
          }
          if(!isNaN(pool[cnt].value)){
            if(pool[cnt].value >= bns){
              expld++;
              var tmp = new this.die(size);
              tmp.roll();
              pool.splice(cnt+1,0,tmp);
            }
          }
          cnt++;
        }
      }
    }
  },
  dropLowest:function(dice,cnt){
    cnt =  isNaN(parseInt(cnt))?1:parseInt(cnt);
    for(var key in dice){
      var pool = dice[key];
      if(Array.isArray(pool)){
        var low, pos, pop, tote, actv = [];
        for(var i = 0; i < pool.length;i++){
          if(!isNaN(pool[i].value)){
            actv.push(i);
          }
        }
        tote = actv.length;
        for(var j = 0; j < cnt;j++){
          if(cnt > tote){
            break;
          }
          low = pool[actv[0]].value;
          pos = actv[0];
          pop = 0;
          for(var i = 0; i < actv.length;i++){
            if(pool[actv[i]].value < low){
              low = pool[actv[i]].value;
              pos = actv[i];
              pop = i;
            }
          }
          pool[pos].value = 'dl'+pool[pos].value;
          actv.splice(pop,1);
        }
      }
    }
  },
  keepLowest:function(dice,cnt){
    cnt =  isNaN(parseInt(cnt))?-1:parseInt(cnt);
    for(var key in dice){
      var pool = dice[key];
      if(Array.isArray(pool)){
        var hgh, pos, pop, tote, actv = [],
          tcnt;
        for(var i = 0; i < pool.length;i++){
          if(!isNaN(pool[i].value)){
            actv.push(i);
          }
        }
        tcnt = cnt == -1?actv.length-1:cnt;
        tote = actv.length-tcnt;
        for(var j = 0; j < tote;j++){
          if(tote < 0){
            break;
          }
          hgh = pool[actv[0]].value;
          pos = actv[0];
          pop = 0;
          for(var i = 0;i < actv.length;i++){
            if(pool[actv[i]].value > hgh){
              hgh = pool[actv[i]].value;
              pos = actv[i];
              pop = i;
            }
          }
          pool[pos].value ='dh'+pool[pos].value;
          actv.splice(pop,1);
        }
      }
    }
  },
  countSuccess:function(dice,trgt){
    var success = 0,
      botch = dice.hasOwnProperty('c')?true:false,
      bonus = dice.hasOwnProperty('a')?true:false;
    trgt = isNaN(parseInt(trgt))?-1:parseInt(trgt);
    for(var key in dice){
      var pool = dice[key];
      if(Array.isArray(pool)){
        if(trgt == -1){
          trgt = pool[0].sides;
        }
        for(var i = 0; i < pool.length; i++){
          if(pool[i].value >= trgt){
            success++;
            if(pool[i].value == pool[i].sides && bonus){
              success++;
            }
          }
          if(pool[i].value == 1 && botch){
            success--;
          }
        }
        success = success < 0?0:success;
      }
    }
    delete dice['+'];
    delete dice['c'];
    delete dice['a'];
    dice.Success = success;
  },
  getTotal:function(dice,plus){
    var total = parseInt(plus,10);
    for(var key in dice){
      if(/\d*d%/.test(key)){
        total = dice[key];
        delete dice[key];
      }
      else if(key.length > 1&&key.length < 6){
        if(Array.isArray(dice[key])){
          var tmp = dice[key];
          for(var i = 0;i < tmp.length;i++){
            total += isNaN(tmp[i].value)?0:tmp[i].value;
          }
        }
        else{
          total += dice[key];
        }
      }
    }
    dice.Total = total;
  },
  saveRoll:function(){
    var mtch = false,where, save = this.grabText();
    if(save !== this.error){
      var name = prompt("Enter Name For Roll",save);
      if(name == null) return;
      for(var roll in this.saved){
        if(this.saved[roll] == save){
          mtch = true;
          where = roll;
        }
      }
      if(!mtch){
        if(this.saved[name]) mtch=true;
           this.saved[name] = save;
        if(!mtch){
          var li = $($('li.template')).clone(true);
          $('#saved')
            .append(
              $(li)
                .removeClass('template')
                .append(name)
                .dblclick(function(){
                  Roller.fillInput(this);
                })
          );
        }
      }else{
        alert("Already saved as "+where);
      }
    }
    localStorage.savedRolls = JSON.stringify(this.saved);
  },
  formatResult:function(dice){
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
            if(die[i].value == die[i].sides){
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
  },
  die:function(sides){
    this.sides = sides;
    this.value = 0;
    this.roll = function(){
      this.value = Math.floor(Math.random() * (sides) + 1);
    };
  },
  error:'Check Input',
  saved:{}
};
