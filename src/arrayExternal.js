function arraySum(/*?*/mapArg){
  var result=0,
      that=createMap(this,mapArg),
      i=0,l=that.length|0;
  for(;i<l;i++)if(i in that)result+=+that[i];
  return result
}
extendBuiltInObject($Array,{
  merge: function(arrayLike){
    push.apply(this,arrayLike);
    return this;
  },
  each:function(/*callbackfn[,thisArg]*/){
    forEach.apply(this,arguments);
    return this
  },//////////////////////////////////////
  hmap:function(callbackfn/*?*/,thisArg){
    var self=arrayLikeSelf(this),
        i=0,length=self.length|0,
        result=Array(length);
    while(length > i)result[i]=callbackfn.call(thisArg,self[i],i++,this);
    return result
  },//////////////////////////////////////
  update:function(callbackfn/*?*/,thisArg){
    var i=0,length=this.length|0;
    while(length > i)this[i]=callbackfn.call(thisArg,this[i],i++,this);
    return this
  },
  // http://wiki.ecmascript.org/doku.php?id=strawman:array_fill_and_move
  fill:fill,
  props:props,//////////////////////////////////////
  has:function(el/*?*/,that){
    return some.call(this,createTestCallback(el),that)
  },//////////////////////////////////////
  none:function(el/*?*/,that){
    return !some.call(this,createTestCallback(el),that)
  },//////////////////////////////////////
  count:function(mapArg/*?*/,that){
    return filter.call(this,createTestCallback(mapArg),that).length
  },
  sum:arraySum,
  avg:function(/*?*/mapArg){
    return this.length?arraySum.call(this,mapArg)/this.length:0
  },
  min:function(/*?*/mapArg){
    var result=Infinity,
        that=createMap(this,mapArg),
        i=0,length=that.length|0;
    for(;i<length;i++)if(i in that && result > that[i])result=that[i];
    return result
  },
  max:function(/*?*/mapArg){
    var result=-Infinity,
        that=createMap(this,mapArg),
        i=0,length=that.length|0;
    for(;i<length;i++)if(i in that && that[i] > result)result=that[i];
    return result
  },
  unique:unique,
  cross:function(arrayLike){
    var result=[],
        that=arrayLikeSelf(this),
        i=0,length=that.length|0,value,
        array=isArray(arrayLike)?arrayLike:toArray(arrayLike);
    while(length > i)!~indexSame(result,value=that[i++])&&~indexSame(array,value)&&result.push(value);
    return result
  },
  last:function(){
    return this[this.length-1]
  }
});
// Array static methods
// http://wiki.ecmascript.org/doku.php?id=strawman:array_statics
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#Array_generic_methods
extendBuiltInObject(Array,
  'map,reduce,reduceRight,filter,forEach,each,every,some,reverse,sort,indexOf,lastIndexOf,concat,splice,shift,unshift,push,pop,has,none,count,sum,avg,min,max,unique,cross,last,find,findIndex'
    .split(',').reduce(function(result,key){
      if(key in $Array)result[key]=unbind.call($Array[key])
      return result
    },{}));
// ES3 fix
extendBuiltInObject(Array,{slice:unbind.call(slice),join:unbind.call(join)});