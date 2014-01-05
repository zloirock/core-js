!function(){
  function arraySum(/*?*/mapArg){
    var result = 0
      , that   = createMap(this, mapArg)
      , i      = 0
      , length = toLength(that.length);
    for(; length > i; i++)if(i in that)result += +that[i];
    return result
  }
  function props(key){
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
  function createMap(that, it){
    switch(classof(it)){
      case 'Function':
        return map.call(that, it);
      case 'String':
      case 'Number':
        return props.call(that, it)
    }
    return arrayLikeSelf(that)
  }
  extendBuiltInObject($Array, {
    at: function(index){
      return arrayLikeSelf(this)[0 > index ? this.length + index : index]
    },
    props   : props,
    reduceTo: reduceTo,
    indexSame: function(val){
      return indexSame(arrayLikeSelf(this), val)
    },
    merge: function(arrayLike){
      push.apply(this, arrayLikeSelf(arrayLike));
      return this;
    },
    sum: arraySum,
    avg: function(/*?*/mapArg){
      return this.length ? arraySum.call(this, mapArg) / this.length : 0
    },
    min: function(/*?*/mapArg){
      return min.apply(undefined, createMap(this, mapArg));
    },
    max: function(/*?*/mapArg){
      return max.apply(undefined, createMap(this, mapArg));
    },
    unique: function(/*?*/mapArg){
      var result = []
        , that   = createMap(this, mapArg)
        , length = toLength(that.length)
        , i      = 0
        , value;
      while(length > i)~indexSame(result, value = that[i++]) || result.push(value);
      return result
    },
    cross: function(arrayLike){
      var result = []
        , that   = arrayLikeSelf(this)
        , length = toLength(that.length)
        , array  = arrayLikeSelf(arrayLike)
        , i = 0
        , value;
      while(length > i)!~indexSame(result, value = that[i++]) && ~indexSame(array, value) && result.push(value);
      return result
    }
  });
}();