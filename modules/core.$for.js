'use strict';
var $       = require('./$')
  , ctx     = require('./$.ctx')
  , safe    = require('./$.uid').safe
  , $def    = require('./$.def')
  , $iter   = require('./$.iter')
  , ENTRIES = safe('entries')
  , FN      = safe('fn')
  , ITER    = safe('iter')
  , forOf          = $iter.forOf
  , stepCall       = $iter.stepCall
  , getIterator    = $iter.get
  , setIterator    = $iter.set
  , createIterator = $iter.create;
function $for(iterable, entries){
  if(!(this instanceof $for))return new $for(iterable, entries);
  this[ITER]    = getIterator(iterable);
  this[ENTRIES] = !!entries;
}

createIterator($for, 'Wrapper', function(){
  return this[ITER].next();
});
var $forProto = $for.prototype;
setIterator($forProto, function(){
  return this[ITER]; // unwrap
});

function createChainIterator(next){
  function Iterator(iter, fn, that){
    this[ITER]    = getIterator(iter);
    this[ENTRIES] = iter[ENTRIES];
    this[FN]      = ctx(fn, that, iter[ENTRIES] ? 2 : 1);
  }
  createIterator(Iterator, 'Chain', next, $forProto);
  setIterator(Iterator.prototype, $.that); // override $forProto iterator
  return Iterator;
}

var MapIter = createChainIterator(function(){
  var step = this[ITER].next();
  return step.done
    ? step
    : $iter.step(0, stepCall(this[ITER], this[FN], step.value, this[ENTRIES]));
});

var FilterIter = createChainIterator(function(){
  for(;;){
    var step = this[ITER].next();
    if(step.done || stepCall(this[ITER], this[FN], step.value, this[ENTRIES]))return step;
  }
});

$.mix($forProto, {
  of: function(fn, that){
    forOf(this, this[ENTRIES], fn, that);
  },
  array: function(fn, that){
    var result = [];
    forOf(fn != undefined ? this.map(fn, that) : this, false, result.push, result);
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
$for.getIterator = getIterator;

$def($def.G + $def.F, {$for: $for});