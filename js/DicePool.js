var Die = require('./Die.js');
//This is an object to handle a group of dice
function DicePool(text){
  var _private = {
    dice: parseText(text)
  };
//Internal Functon to create pool
  function parseText(roll){
    if(roll.match('dFS')){
      roll = roll.replace('dFS','d6!-d6!');
    }
    roll = _toPostFix(roll);
    roll = _processDice(roll);
    return roll;
  }

//Public functions
  Object.defineProperties(this,{
    'getPool': {
      value: _getPool.bind(_private),
      emunerable: true
    }
  });
}

//Returns the dice Pool
function _getPool(){
  return this.dice;
}
//Converts the String to a Postfix(RPN) array for processing
function _toPostFix(text){
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
    if(e.match(/-/) && e.length === 1 && a[i+1].match(/d/)){
      a[i+1] = e+a[i+1];
    }
    if(e.match(/[-+v^r!act\(\)]/)&&e.length === 1){
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
  return val;
}
//Processes the PRN and returns an array of objects and values
function _processDice(arry){
  var roll = {}, i = 0, temp = [],keys;
  keys = arry.filter(function(e){
    return e.match(/d/);
  });
  while(arry.length){
    if(arry[0].match(/[v^r!tca+]/)||(arry[0] === '-'&&arry[0].length === 1)){
      if(i + 2 === temp.length||arry[0] === '+'||arry[0] === '-'){
        temp.push(_processAdders(arry.shift(),temp.pop(),temp.pop()));
        if(i >= temp.length){ i = temp.length - 1;}
      } else {
        temp[i] = _processAdders(arry.shift(),temp.pop(),temp[i]);
      }
    } else {
      t = _getDice(arry.shift());
      temp.push(t);
      if(Array.isArray(t)){
        i = temp.length - 1;
      }
    }
  }
  temp[0].forEach(function(e,i,a){
    if(typeof e === 'object'){
      var temp = e.getNote();
      if(temp in roll){
        roll[temp].push(e);
      } else {
        roll[temp] = [e];
      }
    } else if(typeof e === 'number'){
      a[i] = new Die('+',0);
      a[i].setValue(e);
      e = a[i];
      if('+' in roll){
        roll['+'].push(e);
      } else {
        roll['+'] = [e];
      }
    } else {
      roll.Success = e.replace(/[sb]/g,'');
    }
  });
  if(!('Success' in roll)){
    roll.Total = _getTotal(temp[0]);
  }
  return roll;
}
//Takes a string notation and converts *d* into array of dice or numder into int
function _getDice(note){
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
    dice.push(new Die(note,sides));
  }
  _rollDice(note,dice);
  return dice;
}
//Rolls and array of dice and applies special rules if applicable
function _rollDice(note,dice){
  dice.forEach(function(e){
    e.roll();
  });
  if(/\d*d%/.test(note)){
    var prcnt = 0;
    dice.forEach(function(e){
      e.setValue(e.getValue() - 1);
    });
    dice[0].setValue(dice[0].getValue() * 10);
    dice.forEach(function(e){
      prcnt += e.getValue();
    });
    if(prcnt === 0){
      prcnt = 100;
    }
    dice = prcnt;
  }
  else if(/\d*dF/.test(note)){
    var total = 0;
    dice.forEach(function(e){
      var tmp = e.getValue();
      if(tmp === 2||tmp === 3){
        e.setValue(-1);
      }
      else if(tmp === 4||tmp === 6){
        e.setValue(0);
      }
      else if(tmp === 1||tmp === 5){
        e.setValue(1);
      }
      total += e.getValue();
    });
    dice = total;
  }
  return dice;
}
//Switch to handle how to process Roll notations
function _processAdders(op,o1,o2){
  var newO;
  switch(op){
    case 'r':  newO = _reRoll(o1,o2);break;
    case '!':  newO = _explodeRoll(o1,o2);break;
    case 'v':  newO = _dropLowest(o1,o2);break;
    case '^':  newO = _dropHighest(o1,o2);break;
    case 't':
    case 'ta':
    case 'tc':
    case 'tac':
    case 'tca':  newO = _countSuccess(op,o1,o2);break;
    case '+':  newO = _addToRoll(o1,o2);break;
    case '-':  newO = _convertToNeg(o1,o2);break;
  }
  return newO;
}
//Function to reroll dice based on a target number or lower, will use 1 if no number is given
function _reRoll(limit,dice){
  limit = isNaN(limit)?1:limit;
  var cnt = 0, size;
  while(true){
    if(typeof dice[cnt] !== 'object' && dice[cnt] !== undefined){
      cnt++;
      continue;
    }
    if(cnt >= dice.length){
      break;
    }
    size = dice[cnt].getSize();
    if(limit === size){
      continue;
    }
    if(dice[cnt].getValue() <= limit){
      var tmp = new Die(dice[cnt].getNote(),size);
      tmp.roll();
      dice[cnt].inValid('r');
      dice.splice(cnt+1,0,tmp);
    }
    cnt++;
  }
  return dice;
}
//Function to explode(add more die of same type) roll based on target number or higher, will use die size - 1 if no number given
function _explodeRoll(limit,dice){
  limit = isNaN(limit)?-1:limit;
  var cnt = 0, size, bns;
  while(true){
    if(typeof dice[cnt] !== 'object' && dice[cnt] !== undefined){
      cnt++;
      continue;
    }
    if(cnt >= dice.length){
      break;
    }
    if(limit === 1){
      break;
    }
    size = dice[cnt].getSize();
    bns = limit === -1?size:limit;
    if(!isNaN(dice[cnt].getValue())){
      if(dice[cnt].getValue() >= bns){
        var tmp = new Die(dice[cnt].getNote(),size);
        tmp.roll();
        dice.splice(cnt+1,0,tmp);
      }
    }
    cnt++;
  }
  return dice;
}
//Function to drop lowest [number] of rolls out of the pool. Will only drop one if no numebr given
function _dropLowest(cnt,dice){
  cnt =  isNaN(cnt)?-1:cnt;
  var i, j, low, pos, pop, tote, actv = [];
  dice.forEach(function(e,i){
    if(!isNaN(e.getValue())){
      actv.push(i);
    }
  });
  if(!actv.length){
    return dice;
  }
  tote = cnt === -1?1:cnt;
  for(j = 0; j < tote;j++){
    if(tote < 0){
      break;
    }
    low = dice[actv[0]].getValue();
    pos = actv[0];
    pop = 0;
    for(i = 0; i < actv.length;i++){
      if(dice[actv[i]].getValue() < low){
        low = dice[actv[i]].getValue();
        pos = actv[i];
        pop = i;
      }
    }
    dice[pos].inValid('dl');
    actv.splice(pop,1);
  }
  return dice;
}
//Function to drop highest [number] of rolls out of the pool. Will only drop one if no numebr given
function _dropHighest(cnt,dice){
  cnt =  isNaN(cnt)?-1:cnt;
  var i, j, hgh, pos, pop, tote, actv = [];
  dice.forEach(function(e,i){
    if(!isNaN(e.getValue())){
      actv.push(i);
    }
  });
  if(!actv.length){
    return dice;
  }
  tote = cnt === -1?1:cnt;
  for(j = 0; j < tote;j++){
    if(tote < 0){
      break;
    }
    hgh = dice[actv[0]].getValue();
    pos = actv[0];
    pop = 0;
    for(i = 0;i < actv.length;i++){
      if(dice[actv[i]].getValue() > hgh){
        hgh = dice[actv[i]].getValue();
        pos = actv[i];
        pop = i;
      }
    }
    dice[pos].inValid('dh');
    actv.splice(pop,1);
  }
  return dice;
}
//Function to switch to Success based rolling. Moditfiers can be added to include botch(1 subtracts) or bonus(max value adds 1).
function _countSuccess(op,trgt,dice){
  var success = 0,
    botch = op.match(/c/)?true:false,
    bonus = op.match(/a/)?true:false;
  dice.forEach(function(e){
    var t = isNaN(trgt)?-1:trgt;
    if(t === -1){
      t = e.getSize();
    }
    if(e.getValue() >= t){
      success++;
      if(e.getValue() === e.getSize() && bonus){
        success++;
      }
    }
    if(e.getValue() === 1 && botch){
      success--;
    }
  });
  success = success < 0?'b'+success:success;
  dice.push('s'+success);
  return dice;
}
//Function to combine polls together. Will just append single value to array
function _addToRoll(adder,roll){
  return [].concat.apply([],[roll,adder]);
}
//Function to convert values to negative for subtration
function _convertToNeg(roll,adder){
  if(typeof roll === 'object'){
    roll.forEach(function(e){
      if(typeof e !== 'object'){
        return;
      }
      if(e.getNote().match(/-/)){
        e.setValue(e.getValue()*-1);
      }
    });
  } else {
    roll = roll * -1;
  }
  return _addToRoll(roll,adder);
}
//Function to total rolls value if not success based
function _getTotal(dice){
  var total = 0;
  dice.forEach(function(e,i,a){
    if(typeof e.getValue() === 'number'){
      total += e.getValue();
    }
  });
  return total;
}

module.exports = DicePool;