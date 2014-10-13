$define(PROTO + FORCED, NUMBER, {
  times: function(mapfn /* = -> it */, that /* = undefined */){
    var number = +this
      , length = toLength(number)
      , result = Array(length)
      , i      = 0
      , f;
    if(mapfn != undefined){
      f = ctx(mapfn, that, 1);
      while(length > i)result[i] = f(i++);
    } else while(length > i)result[i] = i++;
    return result;
  },
  random: function(lim /* = 0 */){
    var a = +this
      , b = lim == undefined ? 0 : +lim
      , m = min(a, b);
    return random() * (max(a, b) - m) + m;
  }
});
$define(PROTO + FORCED, NUMBER, turn.call(
  array(
    // ES3:
    'round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,sqrt,max,min,pow,atan2,' +
    // ES6:
    'acosh,asinh,atanh,cbrt,clz32,cosh,expm1,hypot,imul,log1p,log10,log2,sign,sinh,tanh,trunc'
  ),
  function(memo, key){
    var fn = Math[key];
    if(fn)memo[key] = function(/* ...args */){
      // ie9- dont support strict mode & convert `this` to object -> convert it to number
      var args = [+this]
        , i    = 0;
      while(arguments.length > i)args.push(arguments[i++]);
      return invoke(fn, args);
    }
  }, {}
));