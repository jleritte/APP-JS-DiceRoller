import Die from './Die.js'
let  dice = {}, _text

export default class DicePool {
  constructor(text) {
    dice = parseText(text)
    text = _text
  }
  get pool() {
    dice.text = _text
    return dice
  }
}

function parseText(roll){
  if(roll.match('dFS')){
    roll = roll.replace('dFS','d6!-d6!')
  }

  return processDice(roll)
}

//Converts the String to a Postfix(RPN) array for processing
function* toPostFix(text){
  const PRECEDENCE = {'r':5,'!':4,'v':3,'^':3,'t':2,'+':1,'-':1}
  let operands = []

  for(let elem of text.split(/([-+v^r!act])/)){
    console.log(elem)
    if(elem === '') continue
    if(elem.match(/[-+v^r!act]/) && elem.length === 1){
      let cur = PRECEDENCE[elem],
          last = PRECEDENCE[operands[0]]
      if(elem === 'a'||elem === 'c'){
        operands[0] += elem
      } else if(cur < last){
        yield operands.shift()
        operands.unshift(elem)
      } else{
        operands.unshift(elem)
      }
    } else {
      yield elem
    }
  }
  while(operands.length){
    yield operands.shift()
  }
}
//Processes the RPN and returns an array of objects and values
function processDice(rollStr){
  let roll = {}, i = 0, temp = []

  for(let elem of toPostFix(rollStr)){
    if(elem.match(/[v^r!tca+]/)||(elem === '-' && elem.length === 1)){
      if(i + 2 >= temp.length||elem === '+'||elem === '-'){
        console.log('double pop')
        temp.push(processAdders(elem,temp.pop(),temp.pop()))
        i = i >= temp.length ? i = temp.length - 1 : i
      } else {
        console.log('single pop')
        temp[i] = processAdders(elem,temp.pop(),temp[i])
      }
    } else {
      let t = getDice(elem)
      temp.push(t)
      if(Array.isArray(t)){
        i = temp.length - 1
      }
    }
    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
    console.log(elem,i,[...temp])
    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
  }
  temp[0].forEach(function(e,i,a){
    if(typeof e === 'object'){
      var temp = e.note;
      if(temp in roll){
        roll[temp].push(e);
      } else {
        roll[temp] = [e];
      }
    } else if(typeof e === 'number'){
      a[i] = new Die('+',0);
      a[i].value = e;
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
    roll.Total = getTotal(temp[0]);
  }
  return roll;
}
//Takes a string notation and converts *d* into array of dice or number into int
function getDice(note){
  var num,sides,dice =[],roll;
  if(/\d*d\d+/.test(note)){
    roll = note.split('d');
    num = isNaN(parseInt(roll[0]))?1:Math.abs(roll[0]);
    sides = parseInt(roll[1]);
  }
  else if(/\d*d%/.test(note)){
    num = 1;
    sides = 100;
  }
  else if(/\d*dF/.test(note)){
    roll = note.split('d');
    num = isNaN(parseInt(roll[0]))?1:Math.abs(roll[0]);
    sides = 6;
  }
  else{
    return parseInt(note);
  }
  while(dice.length < num){
    dice.push(new Die(note,sides));
  }
  rollDice(note,dice);
  return dice;
}
//Rolls and array of dice and applies special rules if applicable
function rollDice(note,dice){
  if(/\d*dF/.test(note)){
    var total = 0;
    dice.forEach(function(e){
      var tmp = e.value;
      if(tmp === 2||tmp === 3){
        e.value = -1;
      }
      else if(tmp === 4||tmp === 6){
        e.value = 0;
      }
      else if(tmp === 1||tmp === 5){
        e.value = 1;
      }
      total += e.value;
    });
    dice = total;
  }
  return dice;
}
//Switch to handle how to process Roll notations
function processAdders(op,o1,o2){
  console.log("*************************")
  console.log(op,o1,o2)
  var newO;
  switch(op){
    case 'r':  newO = reRoll(o1,o2);break;
    case '!':  newO = explodeRoll(o1,o2);break;
    case 'v':  newO = dropLowest(o1,o2);break;
    case '^':  newO = dropHighest(o1,o2);break;
    case 't':
    case 'ta':
    case 'tc':
    case 'tac':
    case 'tca':  newO = countSuccess(op,o1,o2);break;
    case '+':  newO = addToRoll(o1,o2);break;
    case '-':  newO = convertToNeg(o1,o2);break;
  }
  console.log(newO)
  console.log("*************************")
  return newO;
}
//Function to re-roll dice based on a target number or lower, will use 1 if no number is given
function reRoll(limit,dice){
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
    size = dice[cnt].size;
    if(limit === size){
      continue;
    }
    if(dice[cnt].value <= limit){
      var tmp = new Die(dice[cnt].note,size);
      tmp.roll
      dice[cnt].inValid = 'r'
      dice.splice(cnt+1,0,tmp);
    }
    cnt++;
  }
  return dice;
}
//Function to explode(add more die of same type) roll based on target number or higher, will use die size - 1 if no number given
function explodeRoll(limit,dice){
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
    size = dice[cnt].size;
    bns = limit === -1?size:limit;
    if(!isNaN(dice[cnt].value)){
      if(dice[cnt].value >= bns){
        var tmp = new Die(dice[cnt].note,size);
        tmp.roll
        dice.splice(cnt+1,0,tmp);
      }
    }
    cnt++;
  }
  return dice;
}
//Function to drop lowest [number] of rolls out of the pool. Will only drop one if no number given
function dropLowest(cnt,dice){
  cnt =  isNaN(cnt)?-1:cnt;
  var i, j, low, pos, pop, tote, actv = [];
  dice.forEach(function(e,i){
    if(!isNaN(e.value)){
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
    dice[pos].inValid = 'dl'
    actv.splice(pop,1);
  }
  return dice;
}
//Function to drop highest [number] of rolls out of the pool. Will only drop one if no number given
function dropHighest(cnt,dice){
  cnt =  isNaN(cnt)?-1:cnt;
  var i, j, hgh, pos, pop, tote, actv = [];
  dice.forEach(function(e,i){
    if(!isNaN(e.value)){
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
    dice[pos].inValid = 'dh'
    actv.splice(pop,1);
  }
  return dice;
}
//Function to switch to Success based rolling. Modifiers can be added to include botch(1 subtracts) or bonus(max value adds 1).
function countSuccess(op,trgt,dice){
  var success = 0,
    botch = op.match(/c/)?true:false,
    bonus = op.match(/a/)?true:false;
  dice.forEach(function(e){
    var t = isNaN(trgt)?-1:trgt;
    if(t === -1){
      t = e.size;
    }
    if(e.value >= t){
      success++;
      if(e.value === e.size && bonus){
        success++;
      }
    }
    if(e.value === 1 && botch){
      success--;
    }
  });
  success = success < 0?'b'+success:success;
  dice.push('s'+success);
  return dice;
}
//Function to combine polls together. Will just append single value to array
function addToRoll(adder,roll){
  return [].concat.apply([],[roll,adder]);
}
//Function to convert values to negative for subtraction
function convertToNeg(roll,adder){
  console.log(roll,adder)
  if(typeof roll === 'object'){
    roll.forEach(function(e){
      if(typeof e !== 'object'){
        return;
      }
      if(e.note.match(/-/)){
        if(e.value > 0){
          e.value = e.value*-1;
        }
      }
    });
  }
  return addToRoll(roll,adder);
}
//Function to total rolls value if not success based
function getTotal(dice){
  var total = 0;
  dice.forEach(function(e,i,a){
    if(typeof e.value === 'number'){
      total += e.value;
    }
  });
  return total;
}
