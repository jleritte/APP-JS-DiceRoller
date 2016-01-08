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
/*Moving to Dicepool*/
  lib.parseText = function(roll){
    roll = {'text': roll};
    roll.postfix = lib.toPostFix(roll.text);
    roll = lib.processDice(roll.postfix.split(','));
    console.log(roll);
    return roll;
  };
  lib.toPostFix = function(text){
    var val = [],ops = [];
    text = text.split(/([-+v^r!act\(\)])/);
    text = text.filter(function(e,i,a){
      var keep = true;
      if(i === 0 && e === ''){
        return false;
      }
      if(e === ''){
        if(a[i-1] === ')'||a[i-1] === 'a'||a[i-1] === 'c'){
          keep = false;
        } else if(a[i+1] === "("){
          keep = false;
          if(a[i-1].match(/[v^r!tca]/)){
            keep = true;
          }
        }
      }
      return keep;
    });
    text.forEach(function(e,i,a){
      var PRECEDENCE = {'r':5,'!':4,'v':3,'^':3,'t':2,'+':1,'-':1};
      if(e.match(/-/) && e.length === 1){
        a[i+1] = e+a[i+1];
        e = '+';
      }
      if(e.match(/[+v^r!act\(\)]/)){
        var cur = PRECEDENCE[e],
            last = PRECEDENCE[ops[0]];
        if(e === ')'){
          var esc = true;
          while(esc){
            if(ops[0] !== '('){
              val.push(ops.shift());
              if(ops[0] === '('){
                ops.shift();
                esc = false;
              }
            }
          }
        } else if(e === 'a'||e === 'c'){
          ops[0] += e;
        } else if(cur < last&& e !== '('){
          val.push(ops.shift());
          ops.unshift(e);
        } else{
          ops.unshift(e);
        }
      } else {
        val.push(e);
      }
    });
    while(ops.length){
      val.push(ops.shift());
    }
    return val.join(',');
  };
  lib.processDice = function(arry){
    var roll = {}, i = 0, temp = [],keys = arry.slice();
    while(arry.length > 0){
      if(arry[0].match(/[v^r!tca+]/)){
        if(i + 2 === temp.length||arry[0] === '+'){
          temp.push(lib.processAdders(arry.shift(),temp.pop(),temp.pop()));
          if(i >= temp.length){ i = temp.length - 1;}
        } else {
          temp[i] = lib.processAdders(arry.shift(),temp.pop(),temp[i]);
        }
      } else {
        t = lib.getDice(arry.shift());
        temp.push(t);
        if(Array.isArray(t)){
          i = temp.length - 1;
        }
      }
    }
    temp[0].forEach(function(e){
      if(typeof e === 'object'){
        var temp = 'd'+e.sides;
        if(temp in roll){
          roll[temp].push(e);
        } else {
          roll[temp] = [e];
        }
      } else if(typeof e === 'number'){
        if('+' in roll){
          roll['+'].push(e);
        } else {
          roll['+'] = [e];
        }
      } else {
        roll.success = e.replace('s','');
      }
    });
    if(!('success' in roll)){
      roll.total = lib.getTotal(temp[0]);
    }
    console.log(roll,arry,keys);
    return roll;
  };
  lib.getDice = function(note){
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
      return parseInt(note);
    }
    while(dice.length < num){
      dice.push(new this.die(sides));
    }
    lib.rollDice(note,dice);
    return dice;
  };
  lib.rollDice = function(note,dice){
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
        if(tmp === 2||tmp === 3){
          dice[i].value = -1;
        }
        else if(tmp === 4||tmp === 6){
          dice[i].value = 0;
        }
        else if(tmp === 1||tmp === 5){
          dice[i].value = 1;
        }
        total += dice[i].value;
      }
      dice = total;
    }
    return dice;
  };
  lib.processAdders = function(op,o1,o2){
    var newO;
    switch(op){
      case 'r':  newO = lib.reRoll(o1,o2);break;
      case '!':  newO = lib.explodeRoll(o1,o2);break;
      case 'v':  newO = lib.dropLowest(o1,o2);break;
      case '^':  newO = lib.dropHighest(o1,o2);break;
      case 't':
      case 'ta':
      case 'tc':
      case 'tac':
      case 'tca':  newO = lib.countSuccess(op,o1,o2);break;
      case '+':  newO = lib.addToRoll(o1,o2);break;
    }
    return newO;
  };
  lib.reRoll = function(limit,dice){
    limit = isNaN(limit)?1:limit;
    var cnt = 0, size;
    while(true){
      if(cnt >= dice.length){
        break;
      }
      size = dice[cnt].sides;
      if(limit === size){
        continue;
      }
      if(dice[cnt].value <= limit){
        var tmp = new this.die(size);
        tmp.roll();
        dice[cnt].value = 'r'+dice[cnt].value;
        dice.splice(cnt+1,0,tmp);
      }
      cnt++;
    }
    return dice;
  };
  lib.explodeRoll = function(limit,dice){
    limit = isNaN(limit)?-1:limit;
    var cnt = 0, size, bns;
    while(true){
      if(cnt >= dice.length){
        break;
      }
      if(limit === 1){
        break;
      }
      size = dice[cnt].sides;
      bns = limit === -1?size - 1:limit;
      if(!isNaN(dice[cnt].value)){
        if(dice[cnt].value >= bns){
          var tmp = new this.die(size);
          tmp.roll();
          dice.splice(cnt+1,0,tmp);
        }
      }
      cnt++;
    }
    return dice;
  };
  lib.dropLowest = function(cnt,dice){
    cnt =  isNaN(cnt)?-1:cnt;
    var i, j, low, pos, pop, tote, actv = [];
    for(i = 0; i < dice.length;i++){
      if(!isNaN(dice[i].value)){
        actv.push(i);
      }
    }
    tote = cnt === -1?1:cnt;
    for(j = 0; j < tote;j++){
      if(tote < 0){
        break;
      }
      low = dice[actv[0]].value;
      pos = actv[0];
      pop = 0;
      for(i = 0; i < actv.length;i++){
        if(dice[actv[i]].value < low){
          low = dice[actv[i]].value;
          pos = actv[i];
          pop = i;
        }
      }
      dice[pos].value = 'dl'+dice[pos].value;
      actv.splice(pop,1);
    }
    return dice;
  };
  lib.dropHighest = function(cnt,dice){
    cnt =  isNaN(cnt)?-1:cnt;
    var i, j, hgh, pos, pop, tote, actv = [];
    for(i = 0; i < dice.length;i++){
      if(!isNaN(dice[i].value)){
        actv.push(i);
      }
    }
    tote = cnt === -1?1:cnt;
    for(j = 0; j < tote;j++){
      if(tote < 0){
        break;
      }
      hgh = dice[actv[0]].value;
      pos = actv[0];
      pop = 0;
      for(i = 0;i < actv.length;i++){
        if(dice[actv[i]].value > hgh){
          hgh = dice[actv[i]].value;
          pos = actv[i];
          pop = i;
        }
      }
      dice[pos].value ='dh'+dice[pos].value;
      actv.splice(pop,1);
    }
    return dice;
  };
  lib.countSuccess = function(op,trgt,dice){
    var success = 0,
      botch = op.match(/c/)?true:false,
      bonus = op.match(/a/)?true:false;
    for(var i = 0; i < dice.length; i++){
      var t = isNaN(trgt)?-1:trgt;
      if(t === -1){
        t = dice[i].sides;
      }
      if(dice[i].value >= t){
        success++;
        if(dice[i].value === dice[i].sides && bonus){
          success++;
        }
      }
      if(dice[i].value === 1 && botch){
        success--;
      }
    }
    success = success < 0?'b'+success:success;
    dice.push('s'+success);
    return dice;
  };
  lib.addToRoll = function(adder,roll){
    return [].concat.apply([],[roll,adder]);
  };
  lib.getTotal = function(dice){
    var total = 0;
    dice.forEach(function(e,i,a){
      if(typeof e === 'object'){
        if(typeof e.value === 'number'){
          total += e.value;
        }
      } else {
        total += e;
        a[i] = {'value': e};
      }
    });
    return total;
  };
/*end of dicepool moves*/
/*Became its own object*/
  lib.die = function(sides){
    this.sides = sides;
    this.value = 0;
    this.roll = function(){
      this.value = Math.floor(Math.random() * (sides) + 1);
    };
  };

  return me;
})(Roller);
