$define(PROTO, ARRAY, {
  /**
   * Alternatives:
   * http://sugarjs.com/api/Array/at
   * With Proxy: http://www.h3manth.com/new/blog/2013/negative-array-index-in-javascript/
   */
  get: function(index){
    var i = toInteger(index);
    return ES5Object(this)[0 > i ? this.length + i : i];
  },
  set: function(index, value){
    var i = toInteger(index);
    this[0 > i ? this.length + i : i] = value;
    return this;
  },
  'delete': function(index){
    var n = toInteger(index)
      , l = this.length
      , i = 0 > n ? l + n : n;
    if(i >= l || i < 0)return false;
    splice.call(this, i, 1);
    return true;
  },
  // ~ ES7 : https://github.com/domenic/Array.prototype.contains
  contains: function(value){
    var O      = ES5Object(this)
      , length = O.length
      , i      = 0;
    while(length > i)if(sameValueZero(value, O[i++]))return true;
    return false;
  },
  clone: $clone,
  /**
   * Alternatives:
   * http://lodash.com/docs#transform
   */
  turn: turn
});