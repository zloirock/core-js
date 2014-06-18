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
  /**
   * Alternatives:
   * http://lodash.com/docs#transform
   */
  turn: turn,
  clone: $clone,
  // ~ ES7 : http://esdiscuss.org/topic/april-8-2014-meeting-notes#content-1
  contains: function(value){
    var O      = ES5Object(this)
      , length = O.length
      , i      = 0;
    while(length > i)if(i in O && same(value, O[i++]))return true;
    return false;
  }
});