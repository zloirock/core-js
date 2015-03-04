'use strict';
var $           = require('./$')
  , isDef       = $.assert.def
  , $def        = require('./$.def')
  , arrayMethod = require('./$.array-methods');
$def($def.P, 'Array', {
  // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
  copyWithin: function(target /* = 0 */, start /* = 0, end = @length */){
    var O     = Object(isDef(this))
      , len   = $.toLength(O.length)
      , to    = $.toIndex(target, len)
      , from  = $.toIndex(start, len)
      , end   = arguments[2]
      , fin   = end === undefined ? len : $.toIndex(end, len)
      , count = Math.min(fin - from, len - to)
      , inc   = 1;
    if(from < to && to < from + count){
      inc  = -1;
      from = from + count - 1;
      to   = to + count - 1;
    }
    while(count-- > 0){
      if(from in O)O[to] = O[from];
      else delete O[to];
      to += inc;
      from += inc;
    } return O;
  },
  // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
  fill: function(value /*, start = 0, end = @length */){
    var O      = Object(isDef(this))
      , length = $.toLength(O.length)
      , index  = $.toIndex(arguments[1], length)
      , end    = arguments[2]
      , endPos = end === undefined ? length : $.toIndex(end, length);
    while(endPos > index)O[index++] = value;
    return O;
  },
  // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
  find: arrayMethod(5),
  // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
  findIndex: arrayMethod(6)
});

if($.framework){
  var SYMBOL_UNSCOPABLES = require('./$.wks')('unscopables')
    , ArrayProto         = Array.prototype
    , ArrayUnscopables   = ArrayProto[SYMBOL_UNSCOPABLES] || {}
  // 22.1.3.31 Array.prototype[@@unscopables]
  $.each.call($.a('find,findIndex,fill,copyWithin,entries,keys,values'), function(it){
    ArrayUnscopables[it] = true;
  });
  SYMBOL_UNSCOPABLES in ArrayProto || $.hide(ArrayProto, SYMBOL_UNSCOPABLES, ArrayUnscopables);
}