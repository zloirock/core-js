'use strict';
require('./es6.collections');
var $        = require('./$')
  , ctx      = require('./$.ctx')
  , $def     = require('./$.def')
  , $iter    = require('./$.iter')
  , safe     = require('./$.uid').safe
  , ITERATOR = require('./$.wks')('iterator')
  , global   = $.g
  , WRAPPER  = 'Wrapper'
  , ENTRIES  = safe('entries')
  , FN       = safe('fn')
  , INDEX    = safe('index')
  , ITER     = safe('iter')
  , getProto = $.getProto
  , toLength = $.toLength
  , stepCall = $iter.stepCall
  , getIterator = $iter.get;
function fixIteratorPrototype(Constructor){
  if(Constructor && ITERATOR in Constructor.prototype){
    getProto(new Constructor()[ITERATOR]()).__proto__ = $iter.prototype;
  }
}
if(ITERATOR in []){
  var P = getProto(getProto([].keys()));
  if(P == Object.prototype || !$.isFunction(P[ITERATOR]) || P[ITERATOR]() !== P){
    fixIteratorPrototype(Array);
    fixIteratorPrototype(global.Set);
    fixIteratorPrototype(global.Map);
    fixIteratorPrototype(String);
  } else $iter.prototype = P;
}

function setFrom(Constructor, from){
  if(Constructor)$.hide(Constructor, 'from', from || function(iterable){
    return new Constructor(iterable);
  });
}
setFrom(global.Map);
setFrom(global.Set);
setFrom(global.WeakMap);
setFrom(global.WeakSet);
setFrom(global.Dict);
setFrom(String, function(iterable){
  return Array.from(iterable).join('');
});

function Iterator(iterable){
  if(!$iter.is(iterable) && 'next' in iterable)return new WrapperIterator(iterable);
  var iterator = getIterator(iterable);
  return iterator instanceof Iterator ? iterator : new WrapperIterator(iterator);
}
Iterator.prototype = $iter.prototype;

function WrapperIterator(iterator){
  this[ITER] = iterator;
}
$iter.create(WrapperIterator, WRAPPER, function(){
  return this[ITER].next();
})
$iter.set(WrapperIterator.prototype, function(){
  return this[ITER]; // unwrap
});

function MapIterator(iterator, fn, that, entries){
  this[ITER]    = getIterator(iterator);
  this[ENTRIES] = entries;
  this[FN]      = ctx(fn, that, entries ? 2 : 1);
};
$iter.create(MapIterator, WRAPPER, function(){
  var iter = this[ITER]
    , step = iter.next();
  return step.done ? step : $iter.step(0, stepCall(iter, this[FN], step.value, this[ENTRIES]));
});

function FilterIterator(iterator, fn, that, entries){
  this[ITER]    = getIterator(iterator);
  this[ENTRIES] = entries;
  this[FN]      = ctx(fn, that, entries ? 2 : 1);
};
$iter.create(FilterIterator, WRAPPER, function(){
  var iter = this[ITER];
  for(;;){
    var step = iter.next();
    if(step.done || stepCall(iter, this[FN], step.value, this[ENTRIES]))return step;
  }
});

function SkipIterator(iterator, i){
  this[ITER]  = getIterator(iterator);
  this[INDEX] = toLength(i);
};
$iter.create(SkipIterator, WRAPPER, function(){
  for(;;){
    var step = this[ITER].next();
    if(step.done || !this[INDEX] || !this[INDEX]--)return step;
  }
});

function LimitIterator(iterator, i){
  this[ITER]  = getIterator(iterator);
  this[INDEX] = toLength(i);
};
$iter.create(LimitIterator, WRAPPER, function(){
  var iterator = this[ITER];
  if(--this[INDEX] < 0){
    $iter.close(iterator);
    return $iter.step(1);
  } return iterator.next();
});

$.mix($iter.prototype, {
  to: function(to){
    return to.from(this);
  },
  limit: function(i){
    return new LimitIterator(this, i);
  },
  skip: function(i){
    return new SkipIterator(this, i);
  },
  reverse: function(){
    return Array.from(this).reverse().values();
  },
  filter: function(fn, that){
    return new FilterIterator(this, fn, that, false);
  },
  filterPairs: function(fn, that){
    return new FilterIterator(this, fn, that, true);
  },
  map: function(fn, that){
    return new MapIterator(this, fn, that, false);
  },
  mapPairs: function(fn, that){
    return new MapIterator(this, fn, that, true);
  },
  forEach: function(fn, that){
    $iter.forOf(this, false, fn, that);
  },
  forEachPairs: function(fn, that){
    $iter.forOf(this, true, fn, that);
  }
});

$def($def.G + $def.F, {Iterator: Iterator});