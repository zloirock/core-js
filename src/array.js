$define(PROTO, ARRAY, {
  /**
   * Alternatives:
   * http://sugarjs.com/api/Array/at
   * With Proxy: http://www.h3manth.com/new/blog/2013/negative-array-index-in-javascript/
   */
  get: function(index){
    var O      = ES5Object(this)
      , length = toLength(this.length)
      , index  = toInteger(index);
    if(index < 0)index += length;
    return O[index];
  },
  set: function(index, value){
    var length = toLength(this.length)
      , index  = toInteger(index);
    if(index < 0)index += length;
    this[index] = value;
    return this;
  },
  'delete': function(index){
    var length = toLength(this.length)
      , index  = toInteger(index);
    if(index < 0)index += length;
    if(index >= length || index < 0)return false;
    splice.call(this, index, 1);
    return true;
  },
  // ~ ES7 : https://github.com/domenic/Array.prototype.contains
  contains: function(searchElement, fromIndex){
    var O      = ES5Object(this)
      , length = toLength(O.length)
      , index  = toInteger(fromIndex);
    if(index < 0)index = max(index + length, 0);
    while(length > index)if(sameValueZero(searchElement, O[index++]))return true;
    return false;
  },
  clone: $clone,
  /**
   * Alternatives:
   * http://lodash.com/docs#transform
   */
  turn: turn
});