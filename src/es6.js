/**
 * ECMAScript 6 shim
 * http://people.mozilla.org/~jorendorff/es6-draft.html
 * http://wiki.ecmascript.org/doku.php?id=harmony:proposals
 * Alternatives:
 * https://github.com/paulmillr/es6-shim
 * https://github.com/monolithed/ECMAScript-6
 * https://github.com/inexorabletash/polyfill/blob/master/es6.md
 */
!function(isFinite){
  // 20.2.2.28 Math.sign(x)
  function sign(it){
    var n = +it;
    return n == 0 || n != n ? n : n < 0 ? -1 : 1;
  }
  $define(STATIC, OBJECT, {
    // 19.1.3.1 Object.assign(target, source)
    // The assign function is used to copy the values of all of the enumerable
    // own properties from a source object to a target object.
    assign: assign,
    // 19.1.3.10 Object.is(value1, value2)
    is: same
  });
  // 19.1.3.19 Object.setPrototypeOf(O, proto)
  // Works with __proto__ only. Old v8 can't works with null proto objects.
  __PROTO__ && function(set){
    var buggy;
    try { set({}, ArrayProto) }
    catch(e){ buggy = true }
    $define(STATIC, OBJECT, {
      setPrototypeOf: function(O, proto){
        assertObject(O);
        assert(proto === null || isObject(proto), proto, ": can't set as prototype!");
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      }
    });
  }(ctx(call, getOwnDescriptor(ObjectProto, '__proto__').set));
  $define(STATIC, NUMBER, {
    // 20.1.2.1 Number.EPSILON
    EPSILON: pow(2, -52),
    // 20.1.2.2 Number.isFinite(number)
    isFinite: function(it){
      return typeof it == 'number' && isFinite(it);
    },
    // 20.1.2.3 Number.isInteger(number)
    isInteger: function(it){
      return isFinite(it) && floor(it) === it;
    },
    // 20.1.2.4 Number.isNaN(number)
    isNaN: function(number){
      return typeof number == 'number' && number != number;
    },
    // 20.1.2.5 Number.isSafeInteger(number)
    isSafeInteger: function(number){
      return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
    },
    // 20.1.2.6 Number.MAX_SAFE_INTEGER
    MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
    // 20.1.2.10 Number.MIN_SAFE_INTEGER
    MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
    // 20.1.2.12 Number.parseFloat(string)
    parseFloat: parseFloat,
    // 20.1.2.13 Number.parseInt(string, radix)
    parseInt: parseInt
  });
  var isInteger = Number.isInteger
    , abs       = Math.abs
    , exp       = Math.exp
    , log       = Math.log
    , sqrt      = Math.sqrt
    , Oxffff    = 0xffff;
  function asinh(x){
    var n = +x;
    return !isFinite(n) || n === 0 ? n : n < 0 ? -asinh(-n) : log(n + sqrt(n * n + 1));
  }
  $define(STATIC, MATH, {
    // 20.2.2.3 Math.acosh(x)
    // Returns an implementation-dependent approximation to the inverse hyperbolic cosine of x.
    acosh: function(x){
      return log(x + sqrt(x * x - 1));
    },
    // 20.2.2.5 Math.asinh(x)
    // Returns an implementation-dependent approximation to the inverse hyperbolic sine of x.
    asinh: asinh,
    // 20.2.2.7 Math.atanh(x)
    // Returns an implementation-dependent approximation to the inverse hyperbolic tangent of x.
    atanh: function(x){
      return x === 0 ? x : .5 * log((1 + x) / (1 - x));
    },
    // 20.2.2.9 Math.cbrt(x)
    // Returns an implementation-dependent approximation to the cube root of x.
    cbrt: function(x){
      return sign(x) * pow(abs(x), 1 / 3);
    },
    // 20.2.2.11 Math.clz32 (x)
    clz32: function(x){
      var n = x >>> 0;
      return n ? 32 - n[TO_STRING](2).length : 32;
    },
    // 20.2.2.12 Math.cosh(x)
    // Returns an implementation-dependent approximation to the hyperbolic cosine of x.
    cosh: function(x){
      return (exp(x) + exp(-x)) / 2;
    },
    // 20.2.2.14 Math.expm1(x)
    // Returns an implementation-dependent approximation to subtracting 1 from the exponential function of x 
    expm1: function(x){
      return same(x, -0) ? -0 : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
    },
    // 20.2.2.16 Math.fround(x)
    // TODO
    // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
    // Returns an implementation-dependent approximation of the square root
    // of the sum of squares of its arguments.
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
    // 20.2.2.18 Math.imul(x, y)
    imul: function(x, y){
      var xh = Oxffff & x >>> 0x10
        , xl = Oxffff & x
        , yh = Oxffff & y >>> 0x10
        , yl = Oxffff & y;
      return 0 | xl * yl + (xh * yl + xl * yh << 0x10 >>> 0);
    },
    // 20.2.2.20 Math.log1p(x)
    // Returns an implementation-dependent approximation to the natural logarithm of 1 + x.
    // The result is computed in a way that is accurate even when the value of x is close to zero.
    log1p: function(x){
      return (x > -1e-8 && x < 1e-8) ? (x - x * x / 2) : log(1 + x);
    },
    // 20.2.2.21 Math.log10(x)
    // Returns an implementation-dependent approximation to the base 10 logarithm of x.
    log10: function(x){
      return log(x) / Math.LN10;
    },
    // 20.2.2.22 Math.log2(x)
    // Returns an implementation-dependent approximation to the base 2 logarithm of x.
    log2: function(x){
      return log(x) / Math.LN2;
    },
    // 20.2.2.28 Math.sign(x)
    // Returns the sign of the x, indicating whether x is positive, negative or zero.
    sign: sign,
    // 20.2.2.30 Math.sinh(x)
    // Returns an implementation-dependent approximation to the hyperbolic sine of x.
    sinh: function(x){
      var n = +x;
      return n == -Infinity || n == 0 ? n : (exp(n) - exp(-n)) / 2;
    },
    // 20.2.2.33 Math.tanh(x)
    // Returns an implementation-dependent approximation to the hyperbolic tangent of x.
    tanh: function(x){
      var n = +x;
      return isFinite(n) ? n == 0 ? n : (exp(n) - exp(-n)) / (exp(n) + exp(-n)) : sign(n);
    },
    // 20.2.2.34 Math.trunc(x)
    // Returns the integral part of the number x, removing any fractional digits.
    // If x is already an integer, the result is x.
    trunc: function(x){
      var n = +x;
      return n == 0 ? n : (n > 0 ? floor : ceil)(n);
    }
  });
  // 20.2.1.9 Math [ @@toStringTag ]
  setToStringTag(Math, MATH, true);
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  // TODO
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  // TODO
  $define(PROTO, STRING, {
    // 21.1.3.3 String.prototype.codePointAt(pos)
    // TODO
    // 21.1.3.6 String.prototype.contains(searchString, position = 0)
    contains: function(searchString, position /* = 0 */){
      return !!~String(this).indexOf(searchString, position);
    },
    // 21.1.3.7 String.prototype.endsWith(searchString [, endPosition])
    endsWith: function(searchString, endPosition /* = @length */){
      var length = this.length
        , search = '' + searchString
        , end    = toLength(min(endPosition === undefined ? length : endPosition, length));
      return String(this).slice(end - search.length, end) === search;
    },
    // 21.1.3.13 String.prototype.repeat(count)
    repeat: function(count){
      var str    = '' + this
        , result = ''
        , n      = toInteger(count);
      assert(0 <= n, "Count can't be negative");
      for(;n > 0; (n >>= 1) && (str += str))if(n & 1)result += str;
      return result;
    },
    // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
    startsWith: function(searchString, position /* = 0 */){
      var search = '' + searchString
        , index  = toLength(min(position, this.length));
      return String(this).slice(index, index + search.length) === search;
    }
  });
  $define(STATIC, ARRAY, {
    // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
    from: function(arrayLike, mapfn /* -> it */, thisArg /* = undefind */){
      var O       = ES5Object(arrayLike)
        , result  = newGeneric(this, Array)
        , mapping = mapfn !== undefined
        , index   = 0
        , length, f;
      if(mapping)f = optionalBind(mapfn, thisArg);
      if($for && isIterable(O))$for(O).of(function(value){
        push.call(result, mapping ? f(value, index++) : value);
      });
      else for(length = toLength(O.length); length > index; index++){
        push.call(result, mapping ? f(O[index], index) : O[index]);
      }
      return result;
    },
    // 22.1.2.3 Array.of( ...items)
    of: function(/* ...args */){
      var index  = 0
        , length = arguments.length
        , result = newGeneric(this, Array);
      while(length > index)push.call(result, arguments[index++]);
      return result;
    }
  });
  function findIndex(predicate, thisArg /* = undefind */){
    var f      = optionalBind(predicate, thisArg)
      , O      = Object(this)
      , self   = ES5Object(O)
      , length = toLength(self.length)
      , index  = 0;
    for(;length > index; index++)if(f(self[index], index, O))return index;
    return -1;
  }
  $define(PROTO, ARRAY, {
    // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
    // TODO
    // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
    fill: function(value, start /* = 0 */, end /* = @length */){
      var length = toLength(this.length)
        , index  = toInteger(start)
        , endPos;
      if(index < 0)index = max(index + length, 0);
      if(end === undefined)endPos = length;
      else {
        endPos = toInteger(end);
        if(endPos < 0)endPos += length;
        endPos = min(endPos, length);
      }
      while(endPos > index)this[index++] = value;
      return this;
    },
    // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
    find: function(predicate, thisArg /* = undefind */){
      var index = findIndex.call(this, predicate, thisArg);
      if(~index)return ES5Object(this)[index];
    },
    // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
    findIndex: findIndex
  });
  // 24.3.3 JSON [ @@toStringTag ]
  setToStringTag(global.JSON, 'JSON', true);
}(isFinite);