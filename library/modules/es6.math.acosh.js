// 20.2.2.3 Math.acosh(x)
var $def  = require('./$.def')
  , E     = Math.E
  , sqrt  = Math.sqrt;

$def($def.S, 'Math', {
  acosh: function acosh(x){
    return (x = +x) < 1 ? NaN : isFinite(x)
      ? Math.log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
  }
});