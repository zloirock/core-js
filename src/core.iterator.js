'use strict';
require('./es6.collections');
var $        = require('./$')
  , $def     = require('./$.def')
  , Iter     = require('./$.iter')
  , safe     = require('./$.uid').safe
  , ITERATOR = require('./$.wks')('iterator')
  , WRAPPER  = 'Wrapper'
  , ENTRIES  = safe('entries')
  , FN       = safe('fn')
  , INDEX    = safe('index')
  , ITER     = safe('iter');
function fixIteratorPrototype(Constructor){
  if(Constructor && ITERATOR in Constructor.prototype){
    $.getProto(new Constructor()[ITERATOR]()).__proto__ = Iter.prototype;
  }
}
if(ITERATOR in []){
  var P = $.getProto($.getProto([].keys()));
  if(P == Object.prototype || !$.isFunction(P[ITERATOR]) || P[ITERATOR]() !== P){
    fixIteratorPrototype(Array);
    fixIteratorPrototype($.g.Set);
    fixIteratorPrototype($.g.Map);
    fixIteratorPrototype(String);
  } else Iter.prototype = P;
}

function setFrom(Constructor, from){
  if(Constructor)$.hide(Constructor, 'from', from || function(iterable){
    return new Constructor(iterable);
  });
}
setFrom($.g.Map);
setFrom($.g.Set);
setFrom($.g.WeakMap);
setFrom($.g.WeakSet);
setFrom($.g.Dict);
setFrom(String, function(iterable){
  return Array.from(iterable).join('');
});

function Iterator(iterable){
  if(!Iter.is(iterable) && 'next' in iterable)return new WrapperIterator(iterable);
  var iterator = Iter.get(iterable);
  return iterator instanceof Iterator ? iterator : new WrapperIterator(iterator);
}
Iterator.prototype = Iter.prototype;

function WrapperIterator(iterator){
  this[ITER] = iterator;
}
Iter.create(WrapperIterator, WRAPPER, function(){
  return this[ITER].next();
})
Iter.set(WrapperIterator.prototype, function(){
  return this[ITER]; // unwrap
});

function MapIterator(iterator, fn, that, entries){
  this[ITER]    = Iter.get(iterator);
  this[ENTRIES] = entries;
  this[FN]      = $.ctx(fn, that, entries ? 2 : 1);
};
Iter.create(MapIterator, WRAPPER, function(){
  var step = this[ITER].next();
  return step.done ? step : Iter.step(0, Iter.stepCall(this[FN], step.value, this[ENTRIES]));
});

function FilterIterator(iterator, fn, that, entries){
  this[ITER]    = Iter.get(iterator);
  this[ENTRIES] = entries;
  this[FN]      = $.ctx(fn, that, entries ? 2 : 1);
};
Iter.create(FilterIterator, WRAPPER, function(){
  for(;;){
    var step = this[ITER].next();
    if(step.done || Iter.stepCall(this[FN], step.value, this[ENTRIES]))return step;
  }
});

function SkipIterator(iterator, i){
  this[ITER]  = Iter.get(iterator);
  this[INDEX] = $.toLength(i);
};
Iter.create(SkipIterator, WRAPPER, function(){
  for(;;){
    var step = this[ITER].next();
    if(step.done || !this[INDEX] || !this[INDEX]--)return step;
  }
});

function LimitIterator(iterator, i){
  this[ITER]  = Iter.get(iterator);
  this[INDEX] = $.toLength(i);
};
Iter.create(LimitIterator, WRAPPER, function(){
  var iterator = this[ITER];
  if(--this[INDEX] < 0){
    Iter.close(iterator);
    return Iter.step(1);
  } return iterator.next();
});

$.mix(Iter.prototype, {
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
    Iter.forOf(this, false, fn, that);
  },
  forEachPairs: function(fn, that){
    Iter.forOf(this, true, fn, that);
  }
});

$def($def.G + $def.F, {Iterator: Iterator});