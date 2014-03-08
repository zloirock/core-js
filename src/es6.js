/**
 * ECMAScript 6 shim
 * http://people.mozilla.org/~jorendorff/es6-draft.html
 * http://wiki.ecmascript.org/doku.php?id=harmony:proposals
 * Alternatives:
 * https://github.com/paulmillr/es6-shim
 * https://github.com/monolithed/ECMAScript-6
 * https://github.com/inexorabletash/polyfill/blob/master/harmony.js
 */
!function(isFinite){
  function sign(it){
    return (it = +it) == 0 || it != it ? it : it < 0 ? -1 : 1;
  }
  $define(STATIC, 'Object', {
    /**
     * The assign function is used to copy the values of all of the enumerable
     * own properties from a source object to a target object.
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
    is: same
  });
  /**
   * 19.1.3.19 Object.setPrototypeOf ( O, proto )
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.setprototypeof
   * http://kangax.github.io/es5-compat-table/es6/#Object.setPrototypeOf
   * work only if browser support __proto__, don't work with null proto objects
   */
  __PROTO__ && $define(STATIC, 'Object', {
    setPrototypeOf: function(O, proto){
      assertObject(O);
      assert(isObject(proto) || proto === null, "Can't set", proto, 'as prototype');
      O.__proto__ = proto;
      return O;
    }
  });
  $define(STATIC, 'Number', {
    /**
     * 20.1.2.1 Number.EPSILON
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.epsilon
     * http://wiki.ecmascript.org/doku.php?id=harmony:number_epsilon
     */
    EPSILON: pow(2, -52),
    /**
     * 20.1.2.2 Number.isFinite (number)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.isfinite
     * http://wiki.ecmascript.org/doku.php?id=harmony:number.isfinite
     * http://kangax.github.io/es5-compat-table/es6/#Number.isFinite
     */
    isFinite: function(it){
      return typeof it == 'number' && isFinite(it);
    },
    /**
     * 20.1.2.3 Number.isInteger (number)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.isinteger
     * http://wiki.ecmascript.org/doku.php?id=harmony:number.isinteger
     * http://kangax.github.io/es5-compat-table/es6/#Number.isInteger
     */
    isInteger: function(it){
      return isFinite(it) && floor(it) === it;
    },
    /**
     * 20.1.2.4 Number.isNaN (number)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.isnan
     * http://wiki.ecmascript.org/doku.php?id=harmony:number.isnan
     * http://kangax.github.io/es5-compat-table/es6/#Number.isNaN
     */
    isNaN: function(number){
      return typeof number == 'number' && number != number;
    },
    /**
     * 20.1.2.5 Number.isSafeInteger (number)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.issafeinteger
     */
    isSafeInteger: function(number){
      return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
    },
    /**
     * 20.1.2.6 Number.MAX_SAFE_INTEGER
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer
     */
    MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
    /**
     * 20.1.2.10 Number.MIN_SAFE_INTEGER
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.min_safe_integer
     */
    MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
    /**
     * 20.1.2.12 Number.parseFloat (string)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.parsefloat
     */
    parseFloat: parseFloat,
    /**
     * 20.1.2.13 Number.parseInt (string, radix)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.parseint
     */
    parseInt: parseInt
  });
  var isInteger = Number.isInteger
    , abs       = Math.abs
    , exp       = Math.exp
    , log       = Math.log
    , sqrt      = Math.sqrt;
  $define(STATIC, 'Math', {
    /**
     * Returns an implementation-dependent approximation to the inverse hyperbolic cosine of x.
     * 20.2.2.3 Math.acosh(x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.acosh
     * http://kangax.github.io/es5-compat-table/es6/#Math.acosh
     */
    acosh: function(x){
      return log(x + sqrt(x * x - 1));
    },
    /**
     * Returns an implementation-dependent approximation to the inverse hyperbolic sine of x.
     * 20.2.2.5 Math.asinh(x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.asinh
     * http://kangax.github.io/es5-compat-table/es6/#Math.asinh
     */
    asinh: function(x){
      return !isFinite(x = +x) || x === 0 ? x : log(x + sqrt(x * x + 1));
    },
    /**
     * Returns an implementation-dependent approximation to the inverse hyperbolic tangent of x.
     * 20.2.2.7 Math.atanh(x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.atanh
     * http://kangax.github.io/es5-compat-table/es6/#Math.atanh
     */
    atanh: function(x){
      return x === 0 ? x : 0.5 * log((1 + x) / (1 - x));
    },
    /**
     * Returns an implementation-dependent approximation to the cube root of x.
     * 20.2.2.9 Math.cbrt(x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.cbrt
     */
    cbrt: function(x){
      return sign(x) * pow(abs(x), 1/3);
    },
    /**
     * 20.1.3.1 Number.prototype.clz ()
     * Rename to Math.clz32 <= http://esdiscuss.org/notes/2014-01-28
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.prototype.clz
     * http://kangax.github.io/es5-compat-table/es6/#Number.prototype.clz
     */
    clz32: function(number){
      number = number >>> 0;
      return number ? 32 - number.toString(2).length : 32;
    },
    /**
     * Returns an implementation-dependent approximation to the hyperbolic cosine of x.
     * 20.2.2.12 Math.cosh(x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.cosh
     * http://kangax.github.io/es5-compat-table/es6/#Math.cosh
     */
    cosh: function(x){
      return (exp(x) + exp(-x)) / 2;
    },
    /**
     * Returns an implementation-dependent approximation to subtracting 1
     * from the exponential function of x 
     * 20.2.2.14 Math.expm1 (x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.expm1
     * http://kangax.github.io/es5-compat-table/es6/#Math.expm1
     */
    expm1: function(x){
      return same(x, -0) ? -0 : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
    },
    /**
     * 20.2.2.16 Math.fround (x)
    fround: function(x){ TODO },
     * Returns an implementation-dependent approximation of the square root
     * of the sum of squares of its arguments.
     * 20.2.2.17 Math.hypot([ value1 [ , value2 [ , … ] ] ] )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.hypot
     * http://kangax.github.io/es5-compat-table/es6/#Math.hypot
     */
    hypot: function(value1, value2){
      var sum    = 0
        , length = arguments.length
        , value;
      while(length--){
        value = +arguments[length];
        if(value == Infinity || value == -Infinity)return Infinity;
        sum += value * value;
      }
      return sqrt(sum);
    },
    /**
     * 20.2.2.18 Math.imul(x, y)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.imul
     * http://kangax.github.io/es5-compat-table/es6/#Math.imul
     */
    imul: function(x, y){
      var xh = (x >>> 0x10) & 0xffff
        , xl = x & 0xffff
        , yh = (y >>> 0x10) & 0xffff
        , yl = y & 0xffff;
      return xl * yl + (((xh * yl + xl * yh) << 0x10) >>> 0) | 0;
    },
    /**
     * Returns an implementation-dependent approximation to the natural logarithm of 1 + x.
     * The result is computed in a way that is accurate even when the value of x is close to zero.
     * 20.2.2.20 Math.log1p (x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.log1p
     * http://kangax.github.io/es5-compat-table/es6/#Math.log1p
     */
    log1p: function(x){
      return (x > -1e-8 && x < 1e-8) ? (x - x * x / 2) : log(1 + x);
    },
    /**
     * Returns an implementation-dependent approximation to the base 10 logarithm of x.
     * 20.2.2.21 Math.log10 (x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.log10
     * http://kangax.github.io/es5-compat-table/es6/#Math.log10
     */
    log10: function(x){
      return log(x) / Math.LN10;
    },
    /**
     * Returns an implementation-dependent approximation to the base 2 logarithm of x.
     * 20.2.2.22 Math.log2 (x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.log2
     * http://kangax.github.io/es5-compat-table/es6/#Math.log2
     */
    log2: function(x){
      return log(x) / Math.LN2;
    },
    /**
     * Returns the sign of the x, indicating whether x is positive, negative or zero.
     * 20.2.2.28 Math.sign(x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.sign
     * http://kangax.github.io/es5-compat-table/es6/#Math.sign
     */
    sign: sign,
    /**
     * Returns an implementation-dependent approximation to the hyperbolic sine of x.
     * 20.2.2.30 Math.sinh(x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.sinh
     * http://kangax.github.io/es5-compat-table/es6/#Math.sinh
     */
    sinh: function(x){
      return ((x = +x) == -Infinity) || x == 0 ? x : (exp(x) - exp(-x)) / 2;
    },
    /**
     * Returns an implementation-dependent approximation to the hyperbolic tangent of x.
     * 20.2.2.33 Math.tanh(x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.tanh
     * http://kangax.github.io/es5-compat-table/es6/#Math.tanh
     */
    tanh: function(x){
      return isFinite(x = +x) ? x == 0 ? x : (exp(x) - exp(-x)) / (exp(x) + exp(-x)) : sign(x);
    },
    /**
     * Returns the integral part of the number x, removing any fractional digits.
     * If x is already an integer, the result is x.
     * 20.2.2.34 Math.trunc(x)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-math.trunc
     * http://kangax.github.io/es5-compat-table/es6/#Math.trunc
     */
    trunc: function(x){
      return (x = +x) == 0 ? x : (x > 0 ? floor : ceil)(x);
    }
  });
  /**
  $define(STATIC, 'String', {
     * 21.1.2.2 String.fromCodePoint ( ...codePoints)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.fromcodepoint
     * http://kangax.github.io/es5-compat-table/es6/#String.fromCodePoint
    fromCodePoint: function(){ TODO },
     * 21.1.2.4 String.raw ( callSite, ...substitutions)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.raw
    raw: function(){ TODO }
  });
  */
  $define(PROTO, 'String', {
    /**
     * 21.1.3.3 String.prototype.codePointAt (pos)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype.codepointat
     * http://kangax.github.io/es5-compat-table/es6/#String.prototype.codePointAt
    codePointAt: function(pos /* = 0 * /){ TODO },
     * 21.1.3.6 String.prototype.contains (searchString, position = 0 )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype.contains
     * http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/contains
     * http://kangax.github.io/es5-compat-table/es6/#String.prototype.contains
     */
    contains: function(searchString, position /* = 0 */){
      return !!~String(this).indexOf(searchString, position);
    },
    /**
     * 21.1.3.7 String.prototype.endsWith (searchString [, endPosition] )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype.endswith
     * http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
     * http://kangax.github.io/es5-compat-table/es6/#String.prototype.endsWith
     */
    endsWith: function(searchString, endPosition /* = @length */){
      var length = this.length;
      searchString += '';
      endPosition = toLength(min(endPosition === undefined ? length : endPosition, length));
      return String(this).slice(endPosition - searchString.length, endPosition) === searchString;
    },
    /**
     * 21.1.3.13 String.prototype.repeat (count)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype.repeat
     * http://wiki.ecmascript.org/doku.php?id=harmony:string.prototype.repeat
     * http://kangax.github.io/es5-compat-table/es6/#String.prototype.repeat
     */
    repeat: function(count){
      assert(0 <= (count |= 0), "Count can't be negative");
      return Array(count + 1).join(this);
    },
    /**
     * 21.1.3.18 String.prototype.startsWith (searchString [, position ] )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype.startswith
     * http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
     * http://kangax.github.io/es5-compat-table/es6/#String.prototype.startsWith
     */
    startsWith: function(searchString, position /* = 0 */){
      searchString += '';
      position = toLength(min(position, this.length));
      return String(this).slice(position, position + searchString.length) === searchString;
    }
  });
  $define(STATIC, 'Array', {
    /**
     * 22.1.2.1 Array.from ( arrayLike , mapfn=undefined, thisArg=undefined )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.from
     * http://wiki.ecmascript.org/doku.php?id=strawman:array_extras
     * http://kangax.github.io/es5-compat-table/es6/#Array.from
     */
    from: function(arrayLike, mapfn /* -> it */, thisArg /* = undefind */){
      (mapfn === undefined) || assertFunction(mapfn);
      var O = ES5Object(arrayLike)
        , result = new (isFunction(this) ? this : Array)
        , i = 0
        , length, iter, step;
      if(getIterator && isFunction(O[ITERATOR])){
        iter = getIterator(O);
        while(!(step = iter.next()).done)result.push(mapfn ? mapfn.call(thisArg, step.value) : step.value);
      }
      else for(length = toLength(O.length); i < length; i++)result.push(mapfn ? mapfn.call(thisArg, O[i], i, O) : O[i]);
      return result;
    },
    /**
     * 22.1.2.3 Array.of ( ...items )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.of
     * http://wiki.ecmascript.org/doku.php?id=strawman:array_extras
     * http://kangax.github.io/es5-compat-table/es6/#Array.of
     */
    of: function(/*args...*/){
      var i = 0
        , length = arguments.length
        , result = new (isFunction(this) ? this : Array)(length);
      while(i < length)result[i] = arguments[i++];
      return result;
    }
  });
  function findIndex(predicate, thisArg /* = undefind */){
    assertFunction(predicate);
    var O      = Object(this)
      , self   = ES5Object(O)
      , length = toLength(self.length)
      , i = 0;
    for(; i < length; i++){
      if(i in self && predicate.call(thisArg, self[i], i, O))return i;
    }
    return -1;
  }
  $define(PROTO, 'Array', {
    /**
     * 22.1.3.3 Array.prototype.copyWithin (target, start, end = this.length)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.prototype.copywithin
    copyWithin: function(target, start, end){ TODO },
     * 22.1.3.6 Array.prototype.fill (value, start = 0, end = this.length)
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.prototype.fill
     * http://wiki.ecmascript.org/doku.php?id=strawman:array_fill_and_move
     * http://kangax.github.io/es5-compat-table/es6/#Array.prototype.fill
     */
    fill: function(value, start /* = 0 */, end /* = @length */){
      var length = toLength(this.length);
      if((start |= 0) < 0 && (start = length + start) < 0)return this;
      end = end == undefined ? length : end | 0;
      while(end > start)this[start++] = value;
      return this;
    },
    /**
     * 22.1.3.8 Array.prototype.find ( predicate , thisArg = undefined )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.prototype.find
     * http://kangax.github.io/es5-compat-table/es6/#Array.prototype.find
     */
    find: function(predicate, thisArg /* = undefind */){
      var index = findIndex.call(this, predicate, thisArg);
      return index === -1 ? undefined : ES5Object(this)[index];
    },
    /**
     * 22.1.3.9 Array.prototype.findIndex ( predicate , thisArg = undefined )
     * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.prototype.findindex
     * http://kangax.github.io/es5-compat-table/es6/#Array.prototype.findIndex
     */
    findIndex: findIndex
  });
}(isFinite);