/**
 * ECMAScript 6 shim
 * http://people.mozilla.org/~jorendorff/es6-draft.html
 */
!function(isFinite){
  $define(STATIC, OBJECT, {
    // 19.1.3.1 Object.assign(target, source)
    // The assign function is used to copy the values of all of the enumerable
    // own properties from a source object to a target object.
    assign: assign,
    // 19.1.3.10 Object.is(value1, value2)
    is: function(x, y){
      return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
    }
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
  }(ctx(call, getOwnDescriptor(ObjectProto, '__proto__').set, 2));
  
      // 20.1.2.3 Number.isInteger(number)
  var isInteger = Number.isInteger || function(it){
        return isFinite(it) && floor(it) === it;
      }
      // 20.2.2.28 Math.sign(x)
    , sign = Math.sign || function sign(it){
        return (it = +it) == 0 || it != it ? it : it < 0 ? -1 : 1;
      }
    , abs  = Math.abs
    , exp  = Math.exp
    , log  = Math.log
    , sqrt = Math.sqrt;
  // 20.2.2.5 Math.asinh(x)
  function asinh(x){
    return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
  }
  $define(STATIC, NUMBER, {
    // 20.1.2.1 Number.EPSILON
    EPSILON: pow(2, -52),
    // 20.1.2.2 Number.isFinite(number)
    isFinite: function(it){
      return typeof it == 'number' && isFinite(it);
    },
    // 20.1.2.3 Number.isInteger(number)
    isInteger: isInteger,
    // 20.1.2.4 Number.isNaN(number)
    isNaN: sameNaN,
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
  $define(STATIC, MATH, {
    // 20.2.2.3 Math.acosh(x)
    acosh: function(x){
      return log(x + sqrt(x * x - 1));
    },
    // 20.2.2.5 Math.asinh(x)
    asinh: asinh,
    // 20.2.2.7 Math.atanh(x)
    atanh: function(x){
      return x == 0 ? +x : log((1 + +x) / (1 - x)) / 2;
    },
    // 20.2.2.9 Math.cbrt(x)
    cbrt: function(x){
      return sign(x) * pow(abs(x), 1 / 3);
    },
    // 20.2.2.11 Math.clz32 (x)
    clz32: function(x){
      return (x >>>= 0) ? 32 - x[TO_STRING](2).length : 32;
    },
    // 20.2.2.12 Math.cosh(x)
    cosh: function(x){
      return (exp(x) + exp(-x)) / 2;
    },
    // 20.2.2.14 Math.expm1(x)
    expm1: function(x){
      return x == 0 ? +x : x > -1e-6 && x < 1e-6 ? +x + x * x / 2 : exp(x) - 1;
    },
    // 20.2.2.16 Math.fround(x)
    // TODO
    // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
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
      var UInt16 = 0xffff
        , xh = UInt16 & x >>> 16
        , xl = UInt16 & x
        , yh = UInt16 & y >>> 16
        , yl = UInt16 & y;
      return 0 | xl * yl + (xh * yl + xl * yh << 16 >>> 0);
    },
    // 20.2.2.20 Math.log1p(x)
    log1p: function(x){
      return x > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + +x);
    },
    // 20.2.2.21 Math.log10(x)
    log10: function(x){
      return log(x) / Math.LN10;
    },
    // 20.2.2.22 Math.log2(x)
    log2: function(x){
      return log(x) / Math.LN2;
    },
    // 20.2.2.28 Math.sign(x)
    sign: sign,
    // 20.2.2.30 Math.sinh(x)
    sinh: function(x){
      return x == 0 ? +x : (exp(x) - exp(-x)) / 2;
    },
    // 20.2.2.33 Math.tanh(x)
    tanh: function(x){
      return isFinite(x) ? x == 0 ? +x : (exp(x) - exp(-x)) / (exp(x) + exp(-x)) : sign(x);
    },
    // 20.2.2.34 Math.trunc(x)
    trunc: trunc
  });
  // 20.2.1.9 Math[@@toStringTag]
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
        , end    = toLength(min(endPosition === undefined ? length : endPosition, length));
      searchString += '';
      return String(this).slice(end - searchString.length, end) === searchString;
    },
    // 21.1.3.13 String.prototype.repeat(count)
    repeat: function(count){
      var str    = '' + this
        , result = ''
        , n      = toInteger(count);
      assert(0 <= n, "Count can't be negative");
      for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)result += str;
      return result;
    },
    // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
    startsWith: function(searchString, position /* = 0 */){
      var index = toLength(min(position, this.length));
      searchString += '';
      return String(this).slice(index, index + searchString.length) === searchString;
    }
  });
  $define(STATIC, ARRAY, {
    // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
    from: function(arrayLike, mapfn /* -> it */, that /* = undefind */){
      var O       = ES5Object(arrayLike)
        , result  = new (generic(this, Array))
        , mapping = mapfn !== undefined
        , index   = 0
        , length, f;
      if(mapping)f = ctx(mapfn, that, 2);
      if($for && isIterable(O))$for(O).of(function(value){
        result[index] = mapping ? f(value, index) : value;
        index++;
      });
      else for(length = toLength(O.length); length > index; index++){
        result[index] = mapping ? f(O[index], index) : O[index];
      }
      result.length = index;
      return result;
    },
    // 22.1.2.3 Array.of( ...items)
    of: function(/* ...args */){
      var index  = 0
        , length = arguments.length
        , result = new (generic(this, Array))(length);
      while(length > index)result[index] = arguments[index++];
      result.length = length;
      return result;
    }
  });
  $define(PROTO, ARRAY, {
    // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
    // TODO
    // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
    fill: function(value, start /* = 0 */, end /* = @length */){
      var length = toLength(this.length)
        , index  = max(getPositiveIndex(this, start), 0)
        , endPos;
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
    find:      createArrayMethod(5),
    // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
    findIndex: createArrayMethod(6)
  });
  // 24.3.3 JSON[@@toStringTag]
  setToStringTag(global.JSON, 'JSON', true);
}(isFinite);