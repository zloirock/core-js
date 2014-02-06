/**
 * ECMAScript 6 shim
 * http://people.mozilla.org/~jorendorff/es6-draft.html
 * http://wiki.ecmascript.org/doku.php?id=harmony:proposals
 * Alternatives:
 * https://github.com/paulmillr/es6-shim
 * https://github.com/monolithed/ECMAScript-6
 * https://github.com/inexorabletash/polyfill/blob/master/harmony.js
 */
!function(){
  function sign(it){
    return (it = +it) == 0 || it != it ? it : it < 0 ? -1 : 1
  }
  function izFinite(it){
    return typeof it == 'number' && isFinite(it)
  }
  // https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.3
  var isInteger = Number.isInteger || function(it){
      return izFinite(it) && floor(it) == it;
    }
    , isFinite         = global.isFinite
    , MAX_SAFE_INTEGER = 0x1fffffffffffff
    , abs              = Math.abs
    , exp              = Math.exp
    , ln               = Math.log
    , sqrt             = Math.sqrt;
  extendBuiltInObject(Object, {
    /**
     * 19.1.3.1 Object.assign ( target, source )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign
     * http://kangax.github.io/es5-compat-table/es6/#Object.assign
     * http://www.2ality.com/2014/01/object-assign.html
     */
    assign: assign,
    /**
     * 19.1.3.10 Object.is ( value1, value2 )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.is
     * http://wiki.ecmascript.org/doku.php?id=harmony:egal
     * http://kangax.github.io/es5-compat-table/es6/#Object.is
     */
    is: same,
    /**
     * 19.1.3.15 Object.mixin ( target, source )
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-19.1.3.15
     * Removed in Draft Rev 22, January 20, 2014
     */
    mixin: function(target, source){
      return defineProperties(target, getOwnPropertyDescriptors(source))
    }
  });
  /**
   * 19.1.3.19 Object.setPrototypeOf ( O, proto )
   * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-19.1.3.19
   * http://kangax.github.io/es5-compat-table/es6/#Object.setPrototypeOf
   * work only if browser support __proto__, don't work with null proto objects
   */
  if(getPrototypeOf({__proto__: null}) === null)extendBuiltInObject(Object, {
    setPrototypeOf: function(O, proto){
      assert(isObject(O) && (isObject(proto) || proto === null), "Can't set " + proto + ' as prototype of ' + O);
      O.__proto__ = proto;
      return O
    }
  });
  extendBuiltInObject(Number, {
    /**
     * 20.1.2.1 Number.EPSILON
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.1
     * http://wiki.ecmascript.org/doku.php?id=harmony:number_epsilon
     */
    EPSILON: 2.220446049250313e-16,
    /**
     * 20.1.2.2 Number.isFinite (number)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.2
     * http://wiki.ecmascript.org/doku.php?id=harmony:number.isfinite
     * http://kangax.github.io/es5-compat-table/es6/#Number.isFinite
     */
    isFinite: izFinite,
    /**
     * 20.1.2.3 Number.isInteger (number)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.3
     * http://wiki.ecmascript.org/doku.php?id=harmony:number.isinteger
     * http://kangax.github.io/es5-compat-table/es6/#Number.isInteger
     */
    isInteger: isInteger,
    /**
     * 20.1.2.4 Number.isNaN (number)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.4
     * http://wiki.ecmascript.org/doku.php?id=harmony:number.isnan
     * http://kangax.github.io/es5-compat-table/es6/#Number.isNaN
     */
    isNaN: function(number){
      return typeof number == 'number' && number !== number
    },
    /**
     * 20.1.2.5 Number.isSafeInteger (number)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.5
     */
    isSafeInteger: function(number){
      return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
    },
    /**
     * 20.1.2.6 Number.MAX_SAFE_INTEGER
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.6
     */
    MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
    /**
     * 20.1.2.10 Number.MIN_SAFE_INTEGER
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.10
     */
    MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
    /**
     * 20.1.2.12 Number.parseFloat (string)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.12
     */
    parseFloat: parseFloat,
    /***
     * 20.1.2.13 Number.parseInt (string, radix)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.13
     */
    parseInt: parseInt
  });
  extendBuiltInObject($Number, {
    /**
     * 20.1.3.1 Number.prototype.clz ()
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.3.1
     * http://kangax.github.io/es5-compat-table/es6/#Number.prototype.clz
     */
    clz: function(){
      var number = this >>> 0;
      return number ? 32 - number.toString(2).length : 32
    }
  });
  extendBuiltInObject(Math, {
    /**
     * 20.2.2.3 Math.acosh(x)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.3
     * http://kangax.github.io/es5-compat-table/es6/#Math.acosh
     * Returns an implementation-dependent approximation to the inverse hyperbolic cosine of x.
     */
    acosh: function(x){
      return ln(x + sqrt(x * x - 1))
    },
    /***
     * 20.2.2.5 Math.asinh(x)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.5
     * http://kangax.github.io/es5-compat-table/es6/#Math.asinh
     * Returns an implementation-dependent approximation to the inverse hyperbolic sine of x.
     */
    asinh: function(x){
      return !isFinite(x = +x) || x === 0 ? x : ln(x + sqrt(x * x + 1))
    },
    /**
     * 20.2.2.7 Math.atanh(x)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.7
     * http://kangax.github.io/es5-compat-table/es6/#Math.atanh
     * Returns an implementation-dependent approximation to the inverse hyperbolic tangent of x.
     */
    atanh: function(x){
      return x === 0 ? x : 0.5 * ln((1 + x) / (1 - x))
    },
    /**
     * 20.2.2.9 Math.cbrt(x)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.9
     * Returns an implementation-dependent approximation to the cube root of x.
     */
    cbrt: function(x){
      return sign(x) * pow(abs(x), 1/3);
    },
    /**
     * 20.2.2.12 Math.cosh(x)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.12
     * http://kangax.github.io/es5-compat-table/es6/#Math.cosh
     * Returns an implementation-dependent approximation to the hyperbolic cosine of x.
     */
    cosh: function(x){
      return (exp(x) + exp(-x)) / 2
    },
    /**
     * 20.2.2.14 Math.expm1 (x)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.14
     * http://kangax.github.io/es5-compat-table/es6/#Math.expm1
     * Returns an implementation-dependent approximation to subtracting 1 from the exponential function of x 
     */
    expm1: function(x){
      return same(x, -0) ? -0 : x > -1.0e-6 && x < 1.0e-6 ? x + x * x / 2 : exp(x) - 1
    },
    /**
     * 20.2.2.16 Math.fround (x)
     */
    /*fround: function(x){
      
    },*/
    /**
     * 20.2.2.17 Math.hypot([ value1 [ , value2 [ , … ] ] ] )
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.16
     * http://kangax.github.io/es5-compat-table/es6/#Math.hypot
     * Math.hypot returns an implementation-dependent approximation of the square root of the sum of squares of its arguments.
     */
    hypot: function(value1, value2){
      var sum    = 0
        , length = arguments.length
        , val;
      while(length--){
        val = +arguments[length];
        if(val == Infinity || val == - Infinity)return Infinity;
        sum += val * val;
      }
      return sqrt(sum)
    },
    /**
     * 20.2.2.18 Math.imul(x, y)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.17
     * http://kangax.github.io/es5-compat-table/es6/#Math.imul
     */
    imul: function(x, y){
      var xh = (x >>> 0x10) & 0xffff
        , xl = x & 0xffff
        , yh = (y >>> 0x10) & 0xffff
        , yl = y & 0xffff;
      return xl * yl + (((xh * yl + xl * yh) << 0x10) >>> 0) | 0
    },
    /**
     * 20.2.2.20 Math.log1p (x)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.19
     * http://kangax.github.io/es5-compat-table/es6/#Math.log1p
     * Returns an implementation-dependent approximation to the natural logarithm of 1 + x.
     * The result is computed in a way that is accurate even when the value of x is close to zero.
     */
    log1p: function(x){
      return (x > -1.0e-8 && x < 1.0e-8) ? (x - x * x / 2) : ln(1 + x)
    },
    /**
     * 20.2.2.21 Math.log10 (x)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.20
     * http://kangax.github.io/es5-compat-table/es6/#Math.log10
     * Returns an implementation-dependent approximation to the base 10 logarithm of x.
     */
    log10: function(x){
      return ln(x) / Math.LN10
    },
    /**
     * 20.2.2.22 Math.log2 (x)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.21
     * http://kangax.github.io/es5-compat-table/es6/#Math.log2
     * Returns an implementation-dependent approximation to the base 2 logarithm of x.
     */
    log2: function(x){
      return ln(x) / Math.LN2
    },
    /**
     * 20.2.2.28 Math.sign(x)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.28
     * http://kangax.github.io/es5-compat-table/es6/#Math.sign
     * Returns the sign of the x, indicating whether x is positive, negative or zero.
     */
    sign: sign,
    /**
     * 20.2.2.30 Math.sinh(x)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.30
     * http://kangax.github.io/es5-compat-table/es6/#Math.sinh
     * Returns an implementation-dependent approximation to the hyperbolic sine of x.
     */
    sinh: function(x){
      return ((x = +x) == -Infinity) || x == 0 ? x : (exp(x) - exp(-x)) / 2
    },
    /**
     * 20.2.2.33 Math.tanh(x)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.33
     * http://kangax.github.io/es5-compat-table/es6/#Math.tanh
     * Returns an implementation-dependent approximation to the hyperbolic tangent of x.
     */
    tanh: function(x){
      return isFinite(x = +x) ? x == 0 ? x : (exp(x) - exp(-x)) / (exp(x) + exp(-x)) : sign(x)
    },
    /**
     * 20.2.2.34 Math.trunc(x)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.2.2.34
     * http://kangax.github.io/es5-compat-table/es6/#Math.trunc
     * Returns the integral part of the number x, removing any fractional digits. If x is already an integer, the result is x.
     */
    trunc: function(x){
      return (x = +x) == 0 ? x : (x > 0 ? floor : ceil)(x)
    }
  });
  /*
  extendBuiltInObject(String, {
    // 21.1.2.2 String.fromCodePoint ( ...codePoints)
    // https://people.mozilla.com/~jorendorff/es6-draft.html#sec-21.1.2.2
    // http://kangax.github.io/es5-compat-table/es6/#String.fromCodePoint
    fromCodePoint: function(){ TODO },
    // 21.1.2.4 String.raw ( callSite, ...substitutions)
    // https://people.mozilla.com/~jorendorff/es6-draft.html#sec-21.1.2.4
    raw: function(){ TODO }
  });
  */
  extendBuiltInObject($String, {
    /**
     * 21.1.3.3 String.prototype.codePointAt (pos)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-21.1.3.3
     * http://kangax.github.io/es5-compat-table/es6/#String.prototype.codePointAt
     */
    //codePointAt: function(pos /* = 0 */){

    //},
    /**
     * 21.1.3.6 String.prototype.contains (searchString, position = 0 )
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-21.1.3.6
     * http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/contains
     * http://kangax.github.io/es5-compat-table/es6/#String.prototype.contains
     */
    contains: function(searchString, position /* = 0 */){
      return !!~String(this).indexOf(searchString, position)
    },
    /**
     * 21.1.3.7 String.prototype.endsWith (searchString [, endPosition] )
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-21.1.3.7
     * http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
     * http://kangax.github.io/es5-compat-table/es6/#String.prototype.endsWith
     */
    endsWith: function(searchString, endPosition /* = @length */){
      var length = this.length;
      searchString += '';
      endPosition = toLength(min(endPosition === undefined ? length : endPosition, length));
      return String(this).slice(endPosition - searchString.length, endPosition) === searchString
    },
    /**
     * 21.1.3.13 String.prototype.repeat (count)
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-21.1.3.13
     * http://wiki.ecmascript.org/doku.php?id=harmony:string.prototype.repeat
     * http://kangax.github.io/es5-compat-table/es6/#String.prototype.repeat
     */
    repeat: function(count){
      return fill.call(Array(toInteger(count)), this).join('')
    },
    /**
     * 21.1.3.18 String.prototype.startsWith (searchString [, position ] )
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-21.1.3.18
     * http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
     * http://kangax.github.io/es5-compat-table/es6/#String.prototype.startsWith
     */
    startsWith: function(searchString, position /* = 0 */){
      searchString += '';
      position = toLength(min(position, this.length));
      return String(this).slice(position, position + searchString.length) === searchString
    }
  });
  extendBuiltInObject(Array, {
    /**
     * 22.1.2.1 Array.from ( arrayLike , mapfn=undefined, thisArg=undefined )
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-22.1.2.1
     * http://wiki.ecmascript.org/doku.php?id=strawman:array_extras
     * http://kangax.github.io/es5-compat-table/es6/#Array.from
     */
    from: function(arrayLike, mapfn /* -> it */, thisArg /* = undefind */){
      var O = arrayLikeSelf(arrayLike)
        , i = 0
        , length = toLength(O.length)
        , result = new (isFunction(this) ? this : Array)(length);
      if(mapfn)for(; i < length; i++)i in O && (result[i] = mapfn.call(thisArg, O[i], i, O));
      else for(; i < length; i++)i in O && (result[i] = O[i]);
      return result
    },
    /**
     * 22.1.2.3 Array.of ( ...items )
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-22.1.2.3
     * http://wiki.ecmascript.org/doku.php?id=strawman:array_extras
     * http://kangax.github.io/es5-compat-table/es6/#Array.of
     */
    of: function(/*args...*/){
      var i = 0
        , length = arguments.length
        , result = new (isFunction(this) ? this : Array)(length);
      while(i < length)result[i] = arguments[i++];
      return result
    }
  });
  function fill(value, start /* = 0 */, end /* = @length */){
    var length = toLength(this.length);
    if((start |= 0) < 0 && (start = length + start) < 0)return this;
    end = end == undefined ? length : end | 0;
    while(end > start)this[start++] = value;
    return this
  }
  extendBuiltInObject($Array, {
    /**
     * 22.1.3.3 Array.prototype.copyWithin (target, start, end = this.length)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.prototype.copywithin
    copyWithin: function(target, start, end){

    },
     */
    /**
     * 22.1.3.6 Array.prototype.fill (value, start = 0, end = this.length)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-22.1.3.6
     * http://wiki.ecmascript.org/doku.php?id=strawman:array_fill_and_move
     * http://kangax.github.io/es5-compat-table/es6/#Array.prototype.fill
     */
    fill: fill,
    /**
     * 22.1.3.8 Array.prototype.find ( predicate , thisArg = undefined )
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-22.1.3.8
     * http://kangax.github.io/es5-compat-table/es6/#Array.prototype.find
     */
    find: function(predicate, thisArg /* = undefind */){
      var O = Object(this)
        , self = arrayLikeSelf(O)
        , length = toLength(self.length)
        , val, i = 0;
      for(; i < length; i++)if(i in self && predicate.call(thisArg, val = self[i], i, O))return val
    },
    /**
     * 22.1.3.9 Array.prototype.findIndex ( predicate , thisArg = undefined )
     * https://people.mozilla.com/~jorendorff/es6-draft.html#sec-22.1.3.9
     * http://kangax.github.io/es5-compat-table/es6/#Array.prototype.findIndex
     */
    findIndex: function(predicate, thisArg /* = undefind */){
      var O = Object(this)
        , self = arrayLikeSelf(O)
        , length = toLength(self.length)
        , i = 0;
      for(; i < length; i++)if(i in self && predicate.call(thisArg, self[i], i, O))return i;
      return -1
    }
  });
}();