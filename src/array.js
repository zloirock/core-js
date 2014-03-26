$define(PROTO, ARRAY, {
  /**
   * Alternatives:
   * http://sugarjs.com/api/Array/at
   * With Proxy: http://www.h3manth.com/new/blog/2013/negative-array-index-in-javascript/
   */
  at: function(index){
    return this[0 > (index |= 0) ? this.length + index : index];
  },
  reduceTo: reduceTo,
  /**
   * Alternatives:
   * http://mootools.net/docs/core/Types/Array#Array:append
   * http://api.jquery.com/jQuery.merge/
   */
  merge: function(arrayLike){
    push.apply(this, ES5Object(arrayLike));
    return this;
  }
});