// 26.1.5 Reflect.enumerate(target)
var $        = require('./$')
  , $def     = require('./$.def')
  , ITERATOR = require('./$.wks')('iterator')
  , anObject = require('./$.an-object')
  , $Reflect = $.g.Reflect
  // IE Edge has broken Reflect.enumerate
  , BUGGY    = !($Reflect && $Reflect.enumerate && ITERATOR in $Reflect.enumerate({}));

function Enumerate(iterated){
  this._t = anObject(iterated); // target
  this._k = undefined;          // keys
  this._i = 0;                  // next index
}
require('./$.iter-create')(Enumerate, 'Object', function(){
  var that = this
    , keys = that._k
    , key;
  if(keys == undefined){
    that._k = keys = [];
    for(key in that._t)keys.push(key);
  }
  do {
    if(that._i >= keys.length)return {value: undefined, done: true};
  } while(!((key = keys[that._i++]) in that._t));
  return {value: key, done: false};
});

$def($def.S + $def.F * BUGGY, 'Reflect', {
  enumerate: function enumerate(target){
    return new Enumerate(target);
  }
});