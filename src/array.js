$define(PROTO, ARRAY, {
  // ~ ES7 : https://github.com/domenic/Array.prototype.contains
  contains: createArrayContains(true)
});
$define(PROTO + FORCED, ARRAY, {
  /**
   * Alternatives:
   * http://sugarjs.com/api/Array/at
   * With Proxy: http://www.h3manth.com/new/blog/2013/negative-array-index-in-javascript/
   */
  get: function(index){
    var O = ES5Object(this);
    return O[getPositiveIndex(O, index)];
  },
  set: function(index, value){
    this[getPositiveIndex(this, index)] = value;
    return this;
  },
  'delete': function(index){
    var index = getPositiveIndex(this, index);
    if(index >= this.length || index < 0)return false;
    splice.call(this, index, 1);
    return true;
  },
  turn: turn
});