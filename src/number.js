extendBuiltInObject(Number, {
  toInteger: toInt
});
extendBuiltInObject($Number, {
  div: function(divisor){
    var result = this / divisor;
    return (result > 0 ? floor : ceil)(result)
  },
  times: function(fn, that /* = undefined */){
    var i = 0, num = this | 0, result = Array(num);
    if(isFunction(fn))while(num > i)result[i] = fn.call(that, i, i++, this);
    return result
  },
  random: function(number /* = 0 */){
    var a = this || 0
      , b = number || 0
      , m = min(a, b);
    return random() * (max(a, b) - m) + m
  },
  rand: function(number /* = 0 */){
    var a = toInt(this)
      , b = toInt(number)
      , m = min(a, b);
    return floor((random() * (max(a, b) + 1 - m)) + m)
  },
  isOdd: function(){
    return !!(this % 2) && !(this % 1)
  },
  isEven: function(){
    return 0 === this % 2
  },
  format: function(afterDot /* = 0 */, thousandsSeparator /* = '' */, decimalMark /* = '.' */){
    var afterDot    = toLength(afterDot)
      , integer     = String(toInt(this))
      , fractional  = leadZero(toInt(abs(Math.round((this - integer) * pow(10, afterDot)))), afterDot);
    if(thousandsSeparator){
      integer    = integer   .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + thousandsSeparator);
      fractional = fractional.replace(/(\d{3})(?=\d)/g,          '$1' + thousandsSeparator);
    }
    return afterDot ? integer + (decimalMark == undefined ? '.' : decimalMark) + fractional : integer;
  }
});
extendBuiltInObject($Number, reduceTo.call(
  // IE...
  // getOwnPropertyNames(Math),
  splitComma(
    // ES3
    'round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,pow,sqrt,max,min,pow,atan2,' +
    // ES6
    'acosh,asinh,atanh,cbrt,cosh,expm1,hypot,imul,log1p,log10,log2,sign,sinh,tanh,trunc'
  ),
  function(key){
    if(key in Math)this[key] = methodize.call(Math[key]);
  }
));