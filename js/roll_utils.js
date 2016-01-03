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
    roll = lib.matchParenthese(roll);
console.log(roll);
    roll.forEach(function(e,i,a){
      e = e.split(/[+]/);
      a[i] = e;
    });
console.log(roll);
    if(roll.length >1){
      roll = lib.distributeAdders(roll);
    } else {
      roll = [].concat.apply([],roll);
    }
    roll.forEach(function(e,i,a){
      a[i] = e.split(/([+v^r!act])/);
    });
console.log(roll);
    roll.forEach(function(e,i){
      var dice = {};
      if(e.length === 1){
        temp = lib.getDice(e[0]);
        dice[e[0]] = lib.rollDice(e[0],temp);
      }
      else{
        e.forEach(function(f,j,e){
          if(j % 2 === 1){
            return;
          }
          temp = lib.getDice(e[j]);
          if(Array.isArray(temp)){
            dice[e[j]] = lib.rollDice(e[j],temp);
          }
          else{
            if(e[j-1] in dice){
              temp = lib.processDups(e[j-1],dice[e[j-1]],temp,dice[e[0]][0].sides);
            }
            dice[e[j-1]] = temp;
          }
        });
      }
      if(!dice.hasOwnProperty('+')){
        dice['+'] = 0;
      }
      roll[i] = dice;
    });
console.log(roll);
    return roll;
  };
  lib.matchParenthese = function(string){
    var pat = /(.*)\((.*?)\)(.*)/,
        pools = [];
    while(string.match(/\(/)){
      string = string.match(pat);
      string.shift();
      pools.push(string.splice(1,1).join(''));
      string = string.join('');
    }
    if(string){
      pools.push(string);
    }
    return pools;
  };
  lib.distributeAdders = function(pools){
    pools.reverse();
    pools.forEach(function(e,i,a){
      e.forEach(function(f,j,b){
        if(!f.match(/d/)){
          a[i+1].forEach(function(str,k,c){
            c[k] = str + f;
          });
          b[j] = '';
        }
      });
    });
    pools = [].concat.apply([],pools);
    pools = pools.filter(function(e){
      return e !== '';
    });
    pools.reverse();
    return pools;
  };
  lib.processDups = function(key,value,temp,size){
    var rtrn = value || temp;
console.log(rtrn);
    if(value !== temp&&!isNaN(temp)&&!isNaN(value)){
console.log(key,value,temp,size);
    }
    return rtrn;
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
  lib.processAdders = function(dice){
    var keys = Object.keys(dice);
    keys.forEach(function(mod,i){
      if(mod.length === 1) {
        if(mod === 'r'){
          lib.reRollDice(dice,dice[mod]);
          delete dice[mod];
        }
      }
    });
    keys.forEach(function(mod,i){
      if(mod.length === 1) {
        if(mod === '!'){
          lib.explodeRoll(dice,dice[mod]);
          delete dice[mod];
        }
      }
    });
    keys.forEach(function(mod,i){
      if(mod.length === 1) {
        if(mod === 'v'){
          lib.keepLowest(dice,dice[mod]);
        }
        if(mod === '^'){
          lib.keepHighest(dice,dice[mod]);
        }
        if(mod === 't'){
          lib.countSuccess(dice,dice[mod]);
        }
        if(mod === '+'){
          lib.getTotal(dice,dice[mod]);
        }
        delete dice[mod];
      }
    });
  };
  lib.reRollDice = function(dice,limit){
    limit = isNaN(limit)?1:limit;
    for(var key in dice){
      var pool = dice[key];
      if(Array.isArray(pool)){
        var cnt = 0,
          size = pool[0].sides;
        while(true){
          if(limit === size){
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
  };
  lib.explodeRoll = function(dice,limit){
    limit = isNaN(limit)?-1:limit;
    var expld = 0;
    for(var key in dice){
      var pool = dice[key];
      if(Array.isArray(pool)){
        var cnt = 0,
          size = pool[0].sides,
          bns = limit === -1?size-1:limit;
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
  };
  lib.keepHighest = function(dice,cnt){
    var i;
    cnt =  isNaN(cnt)?1:cnt;
    for(var key in dice){
      var pool = dice[key];
      if(Array.isArray(pool)){
        var low, pos, pop, tote, actv = [];
        for(i = 0; i < pool.length;i++){
          if(!isNaN(pool[i].value)){
            actv.push(i);
          }
        }
        tcnt = cnt === -1?actv.length-1:cnt;
        tote = actv.length-tcnt;
        for(var j = 0; j < tote;j++){
          if(tote < 0){
            break;
          }
          low = pool[actv[0]].value;
          pos = actv[0];
          pop = 0;
          for(i = 0; i < actv.length;i++){
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
  };
  lib.keepLowest = function(dice,cnt){
    var i;
    cnt =  isNaN(cnt)?-1:cnt;
    for(var key in dice){
      var pool = dice[key];
      if(Array.isArray(pool)){
        var hgh, pos, pop, tote, actv = [],
          tcnt;
        for(i = 0; i < pool.length;i++){
          if(!isNaN(pool[i].value)){
            actv.push(i);
          }
        }
        tcnt = cnt === -1?actv.length-1:cnt;
        tote = actv.length-tcnt;
        for(var j = 0; j < tote;j++){
          if(tote < 0){
            break;
          }
          hgh = pool[actv[0]].value;
          pos = actv[0];
          pop = 0;
          for(i = 0;i < actv.length;i++){
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
  };
  lib.countSuccess = function(dice,trgt){
    var success = 0,
      botch = dice.hasOwnProperty('c')?true:false,
      bonus = dice.hasOwnProperty('a')?true:false;
    trgt = isNaN(trgt)?-1:trgt;
    for(var key in dice){
      var pool = dice[key];
      if(Array.isArray(pool)){
        if(trgt === -1){
          trgt = pool[0].sides;
        }
        for(var i = 0; i < pool.length; i++){
          if(pool[i].value >= trgt){
            success++;
            if(pool[i].value === pool[i].sides && bonus){
              success++;
            }
          }
          if(pool[i].value === 1 && botch){
            success--;
          }
        }
        success = success < 0?0:success;
      }
    }
    Object.keys(dice).forEach(function(mod){
      if(mod.length === 1) {
        delete dice[mod];
      }
    });
    dice.Success = success;
  };
  lib.getTotal = function(dice,plus){
    var total = parseInt(plus,10);
    for(var key in dice){
      if(/\d*d%/.test(key)){
        total = dice[key];
        delete dice[key];
      }
      else if(key.length > 1 * key.length < 6){
        if(Array.isArray(dice[key])){
          var tmp = dice[key];
          for(var i = 0;i < tmp.length;i++){
            total += isNaN(tmp[i].value)?0:tmp[i].value;
          }
        }
        else{
          total += key === '+'?parseInt(dice[key]):0;
        }
      }
    }
    dice.Total = total;
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