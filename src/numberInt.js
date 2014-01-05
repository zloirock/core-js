function toLength(it){
  var num = toInt(it);
  return num > 0 && izFinite(num) ? num : 0;
}
function sign(it){
  return (it = +it) == 0 || izNaN(it) ? it : it < 0 ? -1 : 1
}
function leadZero(num, length){
  num += '';
  while(num.length < length)num = '0' + num;
  return num;
}
    // http://es5.github.io/#x9.4
var toInt = Number.toInteger || function(it){
      return (it = +it) != it ? 0 : it != 0 && it != Infinity && it != -Infinity ? (it > 0 ? floor : ceil)(it) : it
    }
    // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-20.1.2.4
  , izNaN = Number.isNaN || function(it){
      return typeof it == 'number' && it !== it
    }
    // https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.2
  , izFinite = Number.isFinite || function(it){
      return typeof it == 'number' && isFinite(it)
    }
    // https://people.mozilla.com/~jorendorff/es6-draft.html#sec-20.1.2.3
  , isInt = Number.isInteger || function(it){
      return izFinite(it) && floor(it) == it;
    };