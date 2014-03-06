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
    this._K = kind;
    this._O = O;
    this._i = -1;
  }
  ArrayIterator[prototype].next = function(){
    var O = this._O
      , length = O.length
      , i = ++this._i;
    while(i < length && !(i in O))this._i = ++i;
    if(i >= length)return createIterResultObject(undefined, 1);
    switch(this._K){
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
    var values = this._V = [];
    O.forEach(function(val, key){
      values.push(key);
    });
    this._K = kind;
    this._O = O;
    this._l = values.length;
    this._i = -1;
  }
  MapIterator[prototype].next = function(){
    var that = this
      , O = that._O
      , V = that._V
      , i = ++that._i;
    if(i >= that._l)return createIterResultObject(undefined, 1);
    switch(that._K){
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
    var values = this._V = [];
    O.forEach(function(val){
      values.push(val);
    });
    this._K = kind;
    this._l = values.length;
    this._i = -1;
  }
  SetIterator[prototype].next = function(){
    var that = this
      , V = that._V
      , i = ++that._i;
    if(i >= that._l)return createIterResultObject(undefined, 1);
    if(that._K == VALUE)return createIterResultObject(V[i], 0);
    return createIterResultObject([V[i], V[i]], 0);
  }
  setIterators = {
    entries: createIteratorFactory(SetIterator, KEY+VALUE),
    values: createIteratorFactory(SetIterator, VALUE)
  }
  setIterators[ITERATOR] = createIteratorFactory(SetIterator, VALUE);
  
  ArrayIterator[prototype][ITERATOR] = MapIterator[prototype][ITERATOR] = SetIterator[prototype][ITERATOR] = function(){
    return this;
  };
  
  $define(PROTO, 'Array', arrayIterators);
  $define(PROTO, 'Map', mapIterators);
  $define(PROTO, 'Set', setIterators);
  
  _.forOf = function(it, fn){
    var iterator, step;
    if(isFunction(it.next))iterator = it;
    else if(isFunction(it[ITERATOR]))iterator = it[ITERATOR]();
    else throw TypeError();
    while(!(step = iterator.next()).done)fn(step.value);
  }
}();