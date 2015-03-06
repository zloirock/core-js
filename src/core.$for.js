'use strict';
var $       = require('./$')
  , safe    = require('./$.uid').safe
  , $def    = require('./$.def')
  , $iter   = require('./$.iter')
  , ENTRIES = safe('entries')
  , FN      = safe('fn')
  , ITER    = safe('iter');
function $for(iterable, entries){
  if(!(this instanceof $for))return new $for(iterable, entries);
  this[ITER]    = $iter.get(iterable);
  this[ENTRIES] = !!entries;
}

$iter.create($for, 'Wrapper', function(){
  return this[ITER].next();
});
var $forProto = $for.prototype;
$iter.set($forProto, function(){
  return this[ITER]; // unwrap
});

function createChainIterator(next){
  function Iterator(iter, fn, that){
    this[ITER]    = $iter.get(iter);
    this[ENTRIES] = iter[ENTRIES];
    this[FN]      = $.ctx(fn, that, iter[ENTRIES] ? 2 : 1);
  }
  $iter.create(Iterator, 'Chain', next, $forProto);
  $iter.set(Iterator.prototype, $.that); // override $forProto iterator
  return Iterator;
}

var MapIter = createChainIterator(function(){
  var step = this[ITER].next();
  return step.done ? step : $iter.step(0, $iter.stepCall(this[FN], step.value, this[ENTRIES]));
});

var FilterIter = createChainIterator(function(){
  for(;;){
    var step = this[ITER].next();
    if(step.done || $iter.stepCall(this[FN], step.value, this[ENTRIES]))return step;
  }
});

$.mix($forProto, {
  of: function(fn, that){
    $iter.forOf(this, this[ENTRIES], fn, that);
  },
  array: function(fn, that){
    var result = [];
    $iter.forOf(fn != undefined ? this.map(fn, that) : this, false, result.push, result);
    return result;
  },
  filter: function(fn, that){
    return new FilterIter(this, fn, that);
  },
  map: function(fn, that){
    return new MapIter(this, fn, that);
  }
});

$for.isIterable  = $iter.is;
$for.getIterator = $iter.get;

$def($def.G + $def.F, {$for: $for});