if(DESC && !(Number('0o1') && Number('0b1')))!function(binar, octal, _Number, NumberProto){
  function toNumber(it){
    var m;
    if(isObject(it))it = toPrimitive(it);
    if(typeof it == 'string'){
      if(m = it.match(binar))return parseInt(m[1], 2);
      if(m = it.match(octal))return parseInt(m[1], 8);
    } return +it;
  }
  function toPrimitive(it){
    var fn, val;
    if(isFunction(fn = it.valueOf) && !isObject(val = fn.call(it)))return val;
    if(isFunction(fn = it[TO_STRING]) && !isObject(val = fn.call(it)))return val;
    throw TypeError("Can't convert object to number");
  }
  Number = function Number(it){
    return this instanceof Number ? new _Number(toNumber(it)) : toNumber(it);
  }
  forEach.call(getNames(_Number), function(key){
    key in Number || defineProperty(Number, key, getOwnDescriptor(_Number, key));
  });
  Number[PROTOTYPE] = NumberProto;
  NumberProto[CONSTRUCTOR] = Number;
  hidden(global, NUMBER, Number);
}(/^0b([01]+)$/i, /^0o([0-7]+)$/i, Number, Number[PROTOTYPE]);