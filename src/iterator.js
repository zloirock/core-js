!function(){
  var arrayIterators, mapIterators, setIterators;
  function createIterResultObject(value, done){
    return {value: value, done: !!done};
  }
  function createIteratorFactory(constructor, kind){
    return function(){
      return new constructor(this, kind);
    }
  }
  
  ArrayIterator = function(O, kind){
    assign(this, {
      O: O,
      K: kind,
      i: -1
    });
  }
  ArrayIterator[prototype].next = function(){
    var that   = this
      , O      = that.O
      , length = O.length
      , i      = ++that.i;
    while(i < length && !(i in O))that.i = ++i;
    if(i >= length)return createIterResultObject(undefined, 1);
    switch(that.K){
      case KEY : return createIterResultObject(i, 0);
      case VALUE : return createIterResultObject(O[i], 0);
    }
    return createIterResultObject([i, O[i]], 0);
  }
  arrayIterators = {
    /**
     * 22.1.3.4 Array.prototype.entries ( )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.prototype.entries
     */
    entries: createIteratorFactory(ArrayIterator, KEY+VALUE),
    /**
     * 22.1.3.13 Array.prototype.keys ( )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.prototype.keys
     */
    keys: createIteratorFactory(ArrayIterator, KEY),
    /**
     * 22.1.3.29 Array.prototype.values ( )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.prototype.values
     */
    values: createIteratorFactory(ArrayIterator, VALUE)
  };
  /**
   * 22.1.3.30 Array.prototype [ @@iterator ] ( )
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.prototype-@@iterator
   */
  arrayIterators[ITERATOR] = createIteratorFactory(ArrayIterator, VALUE);
  
  function MapIterator(O, kind){
    var values = [];
    O.forEach(function(val, key){
      values.push(key);
    });
    assign(this, {
      O: O,
      V: values,
      K: kind,
      i: -1
    });
  }
  MapIterator[prototype].next = function(){
    var that = this
      , O = that.O
      , V = that.V
      , i = ++that.i;
    if(i >= V.length)return createIterResultObject(undefined, 1);
    switch(that.K){
      case KEY : return createIterResultObject(V[i], 0);
      case VALUE : return createIterResultObject(O.get(V[i]), 0);
    }
    return createIterResultObject([V[i], O.get(V[i])], 0);
  }
  mapIterators = {
    entries: createIteratorFactory(MapIterator, KEY+VALUE),
    keys: createIteratorFactory(MapIterator, KEY),
    values: createIteratorFactory(MapIterator, VALUE)
  }
  mapIterators[ITERATOR] = createIteratorFactory(MapIterator, KEY+VALUE);
  
  function SetIterator(O, kind){
    var values = [];
    O.forEach(function(val){
      values.push(val);
    });
    assign(this, {
      V: values,
      K: kind,
      i: -1
    });
  }
  SetIterator[prototype].next = function(){
    var that = this
      , V = that.V
      , i = ++that.i;
    if(i >= V.length)return createIterResultObject(undefined, 1);
    if(that.K == VALUE)return createIterResultObject(V[i], 0);
    return createIterResultObject([V[i], V[i]], 0);
  }
  setIterators = {
    entries: createIteratorFactory(SetIterator, KEY+VALUE),
    values: createIteratorFactory(SetIterator, VALUE)
  }
  setIterators[ITERATOR] = createIteratorFactory(SetIterator, VALUE);
  
  var returnThis = Function('return this');
  ArrayIterator[prototype][ITERATOR] = MapIterator[prototype][ITERATOR] = SetIterator[prototype][ITERATOR] = returnThis;
  
  $define(PROTO, 'Array', arrayIterators);
  $define(PROTO, 'Map', mapIterators);
  $define(PROTO, 'Set', setIterators);
  
  // Chrome fix
  if(isFunction([].keys)){
    var proto = getPrototypeOf([].keys());
    if(!(ITERATOR in proto))proto[ITERATOR] = returnThis;
  }
  
  function getIterator(it){
    // plug for library
    if(it instanceof Array)return new ArrayIterator(it, VALUE);
    if(Map && it instanceof Map)return new MapIterator(it, KEY+VALUE);
    if(Set && it instanceof Set)return new SetIterator(it, VALUE);
    assert(isFunction(it[ITERATOR]), it + ' is not iterable!');
    return it[ITERATOR]();
  }
  
  _.forOf = forOf = function(it, fn, that){
    var iterator = getIterator(it)
      , step;
    while(!(step = iterator.next()).done)fn.call(that, step.value);
  }
}();