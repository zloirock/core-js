!function(){
  var returnThis = Function('return this')
    , stringIterators = {}
    , arrayIterators, mapIterators, setIterators;
  function createIterResultObject(value, done){
    return {value: value, done: !!done};
  }
  function createIteratorFactory(constructor, kind){
    return function(){
      return new constructor(this, kind);
    }
  }
  
  function StringIterator(O){
    this.O = O;
    this.i = 0;
  }
  StringIterator[prototype].next = function(){
    var O = this.O
      , i = this.i++;
    return i < O.length
      ? createIterResultObject(O.charAt(i), 0)
      : createIterResultObject(undefined, 1);
  }
  stringIterators[ITERATOR] = createIteratorFactory(StringIterator);
  
  function ArrayIterator(O, kind){
    this.O = O;
    this.K = kind;
    this.i = 0;
  }
  ArrayIterator[prototype].next = function(){
    var that   = this
      , O      = that.O
      , length = O.length
      , i      = that.i++;
    while(i < length && !(i in O))that.i = ++i;
    if(i >= length)return createIterResultObject(undefined, 1);
    switch(that.K){
      case KEY   : return createIterResultObject(i, 0);
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
      i: 0
    });
  }
  MapIterator[prototype].next = function(){
    var that = this
      , O = that.O
      , V = that.V
      , i = that.i++;
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
      i: 0
    });
  }
  SetIterator[prototype].next = function(){
    var that = this
      , V = that.V
      , i = that.i++;
    if(i >= V.length)return createIterResultObject(undefined, 1);
    if(that.K == VALUE)return createIterResultObject(V[i], 0);
    return createIterResultObject([V[i], V[i]], 0);
  }
  setIterators = {
    entries: createIteratorFactory(SetIterator, KEY+VALUE),
    values: createIteratorFactory(SetIterator, VALUE)
  }
  setIterators[ITERATOR] = createIteratorFactory(SetIterator, VALUE);
  
  StringIterator[prototype][ITERATOR] = ArrayIterator[prototype][ITERATOR] = MapIterator[prototype][ITERATOR] = SetIterator[prototype][ITERATOR] = returnThis;
  
  $define(PROTO, 'String', stringIterators);
  $define(PROTO, 'Array', arrayIterators);
  $define(PROTO, 'Map', mapIterators);
  $define(PROTO, 'Set', setIterators);
  
  // v8 fix
  if(framework && isFunction([].keys)){
    var proto = getPrototypeOf([].keys());
    if(!(ITERATOR in proto))proto[ITERATOR] = returnThis;
  }
  
  getIterator = function(it){
    if(it != undefined && isFunction(it[ITERATOR]))return it[ITERATOR]();
    // plug for library
    switch(it && it.constructor){
      case String: return new StringIterator(it);
      case Array: return new ArrayIterator(it, VALUE);
      case Map: return new MapIterator(it, KEY+VALUE);
      case Set: return new SetIterator(it, VALUE);
    }
    throw TypeError(it + ' is not iterable!');
  }
  
  _.forOf = forOf = function(it, fn, that){
    var iterator = getIterator(it)
      , step;
    while(!(step = iterator.next()).done)fn.call(that, step.value);
  }
}();