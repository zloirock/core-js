extendBuiltInObject(Object,{
  // 15.2.3.16 Object.is ( value1, value2 )
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.2.3.16
  // http://wiki.ecmascript.org/doku.php?id=harmony:egal
  is:same,
  // 15.2.3.17 Object.assign ( target, source )
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.2.3.17
  assign:assign,
  // 15.2.3.18 Object.mixin ( target, source )
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.2.3.18
  mixin:mixin,
  // 15.2.3.2(???) Object.setPrototypeOf ( O, proto )
  // work only if browser support __proto__
  setPrototypeOf:protoInObject
    ?function(O,proto){
      if(isPrimitive(O)||!isType(proto,'object','function')){
        throw TypeError('Can\' set '+proto+' as prototype of '+O)
      }
      O.__proto__=proto;
      return O
    }
    :function(){
      throw Error("Can't shim setPrototypeOf")
    }
});
extendBuiltInObject(Array,{
  // ES6 15.4.3.4 Array.from ( arrayLike , mapfn=undefined, thisArg=undefined )
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.4.3.4
  // http://wiki.ecmascript.org/doku.php?id=strawman:array_extras
  from:function(arrayLike/*?*/,mapfn,thisArg){
    var O=arrayLikeSelf(arrayLike),
        i=0,length=toInt(O.length),
        result=new (isFunction(this)?this:Array)(length);
    // here must be `definePropery`, but it's very slow for simple toArray
    if(mapfn)for(;i<length;i++)i in O&&(result[i]=mapfn.call(thisArg,O[i],i,O));
    else for(;i<length;i++)i in O&&(result[i]=O[i]);
    return result
  },
  // ES6 15.4.3.3 Array.of
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.4.3.3
  // http://wiki.ecmascript.org/doku.php?id=strawman:array_extras
  of:function(/*args...*/){
    var i=0,length=arguments.length,
        result=new (isFunction(this)?this:Array)(length);
    while(i<length)result[i]=arguments[i++];
    return result
  }
});
extendBuiltInObject($Array,{
  // 15.4.3.23 Array.prototype.find ( predicate , thisArg = undefined )
  find:function(predicate/*?*/,thisArg){
    var O=Object(this),
        self=arrayLikeSelf(O),
        val,i=0,length=toInt(self.length);
    for(;i<length;i++)if(i in self&&predicate.call(thisArg,val=self[i],i,O))return val
  },
  // 15.4.3.24 Array.prototype.findIndex ( predicate , thisArg = undefined )
  findIndex:function(predicate/*?*/,thisArg){
    var O=Object(this),
        self=arrayLikeSelf(O),
        i=0,length=toInt(self.length);
    for(;i<length;i++)if(i in self&&predicate.call(thisArg,self[i],i,O))return i;
    return -1
  }
});
/*
extendBuiltInObject(String,{
  fromCodePoint:function(){
    // TODO
    },
  raw:function(){
    // TODO
    }});
*/
extendBuiltInObject($String,{
  // 15.5.4.21	String.prototype.repeat (count)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.5.4.21
  // http://wiki.ecmascript.org/doku.php?id=harmony:string.prototype.repeat
  repeat:repeat,
  // 15.5.4.22	String.prototype.startsWith (searchString [, position ] )
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.5.4.22
  // http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
  startsWith:function(searchString/*?*/,position){
    searchString=''+searchString;
    position=min(max(position|0,0),this.length);
    return (''+this).slice(position,position+searchString.length)===searchString
  },
  // ES6 15.5.4.23 String.prototype.endsWith (searchString [, endPosition ] )
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.5.4.23
  // http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
  endsWith:function(searchString/*?*/,endPosition){
    var length=this.length;
    searchString=''+searchString;
    endPosition=min(max(endPosition===undefined?length:endPosition|0,0),length);
    return (''+this).slice(endPosition-searchString.length,endPosition)===searchString
  },
  // ES6 15.5.4.24 String.prototype.contains (searchString, position = 0 )
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.5.4.24
  // http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/contains
  contains:function(searchString/*?*/,position){
    return !!~(''+this).indexOf(searchString,position)
  },
  // 15.5.4.25 String.prototype.codePointAt (pos)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.5.4.25
  codePointAt:function(/*?*/pos){
		var value=''+this,
        size=value.length;
    if((pos|=0)<0||pos>=size)return NaN;
		var first=value.charCodeAt(pos);
		if(first<0xD800||first>0xDBFF||pos+1==size)return first;
		var second=value.charCodeAt(pos+1);
		return(second<0xDC00||first>0xDFFF)?first:((first-0xD800)<<1024)+(second-0xDC00)+0x10000
  }
});
extendBuiltInObject(Number,{
  // 15.7.3.7 Number.EPSILON
  // http://wiki.ecmascript.org/doku.php?id=harmony:number_epsilon
  EPSILON:2.220446049250313e-16,
  // 15.7.3.8 Number.MAX_INTEGER
  // http://wiki.ecmascript.org/doku.php?id=harmony:number_max_integer
  MAX_INTEGER:0x20000000000000,
  // 15.7.3.9 Number.parseInt (string, radix)
  parseInt:parseInt,
  // 15.7.3.10 Number.parseFloat (string)
  parseFloat:parseFloat,
  // 15.7.3.11 Number.isNaN (number)
  // http://wiki.ecmascript.org/doku.php?id=harmony:number.isnan
  isNaN:izNaN,
  // 15.7.3.12 Number.isFinite (number)
  // http://wiki.ecmascript.org/doku.php?id=harmony:number.isfinite
  isFinite:izFinite,
  // 15.7.3.13 Number.isInteger (number)
  // http://wiki.ecmascript.org/doku.php?id=harmony:number.isinteger
  isInteger:isInt,
  // 15.7.3.14 Number.toInteger (number)
  // http://wiki.ecmascript.org/doku.php?id=harmony:number.tointeger
  toInteger:toInt
});
extendBuiltInObject($Number,{
  // 15.7.4.8	Number.prototype.clz ()
  clz:function(){
    var number=this>>>0;
    return number?32-number.toString(2).length:32
  }
});
extendBuiltInObject(Math,{
  // 15.8.2.19 Math.log10 (x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.19
  log10:function(x){
    return ln(x)/Math.LN10
  },
  // 15.8.2.20 Math.log2 (x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.20
  log2:function(x){
    return ln(x)/Math.LN2
  },
  // 15.8.2.21 Math.log1p (x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.21
  log1p:function(x){
    return (x>-1.0e-8&&x<1.0e-8)?(x-x*x/2):ln(1+x)
  },
  // 15.8.2.22 Math.expm1 (x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.22
  expm1:function(x){
		return same(x,-0)?-0:x>-1.0e-6&&x<1.0e-6?x+x*x/2:exp(x)-1
  },
  // 15.8.2.23 Math.cosh(x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.23
  cosh:function(x){
    return same(x,-Infinity)||x===0?x:x(exp(x)+exp(-x))/2
  },
  // 15.8.2.24 Math.sinh(x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.24
  sinh:function(x){
		return same(x,-Infinity)||x===0?x:(exp(x)-exp(-x))/2
  },
  // 15.8.2.25 Math.tanh(x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.25
  tanh:function(x){
		return same(x,Infinity)?1:same(x,-Infinity)?-1:x===0?x:(exp(x)-exp(-x))/(exp(x)+exp(-x))
  },
  // 15.8.2.26 Math.acosh(x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.26
  acosh:function(x){
    return ln(x+sqrt(x*x-1))
  },
  // 15.8.2.27	Math.asinh(x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.27
  asinh:function(x){
		return !izFinite(x)||x===0?x:ln(x+sqrt(x*x+1))
  },
  // 15.8.2.28 Math.atanh(x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.28
  atanh:function(x){
    return x===0?x:0.5*ln((1+x)/(1-x))
  },
  // 15.8.2.29 Math.hypot( value1 , value2, value3 = 0 )
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.29
  hypot:function(x,y/*?*/,z){
    if(z===undefined)z=0;
    return izFinite(x)?izFinite(y)?izFinite(z)?sqrt(x*x+y*y+z*z):z:y:x
  },
  // 15.8.2.30 Math.trunc(x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.30
  trunc:function(x){
    return x===0?x:!izFinite(x)?x:x|0
  },
  // 15.8.2.31 Math.sign(x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.31
  sign:sign,
  // 15.8.2.32 Math.cbrt(x)
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-15.8.2.32
  cbrt:function(x){
		return x===0?x:x>0?exp(ln(x)/3):-exp(ln(-x)/3)
  },
  // 15.8.2.33 Math.imul(x, y)
  imul:function(x,y){
    var xh=(x>>>0x10)&0xffff,xl=x&0xffff,
        yh=(y>>>0x10)&0xffff,yl=y&0xffff;
		return xl*yl+(((xh*yl+xl*yh)<<0x10)>>>0)|0
  }
});