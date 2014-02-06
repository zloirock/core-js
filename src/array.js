!function(){
  function pluck(key){
    var that   = arrayLikeSelf(this)
      , length = toLength(that.length)
      , result = Array(length)
      , i      = 0
      , val;
    for(; length > i; i++)if(i in that){
      val = that[i];
      result[i] = val == undefined ? undefined : val[key]
    }
    return result
  }
  // indexOf with SameValue
  function indexSame(arrayLike, val){
    var length = toLength(arrayLike.length)
      , i      = 0;
    for(; i < length; i++)if(same(arrayLike[i], val))return i;
    return -1
  }
  extendBuiltInObject($Array, {
    /**
     * Alternatives:
     * http://sugarjs.com/api/Array/at
     * With Proxy: http://www.h3manth.com/new/blog/2013/negative-array-index-in-javascript/
     */
    at: function(index){
      return this[0 > (index |= 0) ? this.length + index : index]
    },
    /**
     * Alternatives:
     * http://underscorejs.org/#pluck
     * http://sugarjs.com/api/Array/map
     * http://api.prototypejs.org/language/Enumerable/prototype/pluck/
     */
    pluck: pluck,
    reduceTo: reduceTo,
    /**
     * Alternatives:
     * http://mootools.net/docs/core/Types/Array#Array:append
     * http://api.jquery.com/jQuery.merge/
     */
    merge: function(arrayLike){
      push.apply(this, arrayLikeSelf(arrayLike));
      return this
    },
    /**
     * Alternatives:
     * http://underscorejs.org/#uniq
     * http://sugarjs.com/api/Array/unique
     * http://api.prototypejs.org/language/Array/prototype/uniq/
     * http://mootools.net/docs/more/Types/Array.Extras#Array:unique
     */
    unique: function(){
      var result = []
        , that   = arrayLikeSelf(this)
        , length = toLength(that.length)
        , i      = 0
        , value;
      while(length > i)~indexSame(result, value = that[i++]) || result.push(value);
      return result
    }
  });
}();