/**
 * add `this` as first argument
 * Number.prototype.pow = Math.pow.methodize()
 * 2 .pow(8) => 256
 */
function methodize(){
  var fn = this;
  return function(/*args...*/){
    var i = 0
      , length = arguments.length
      , args = Array(length + 1);
    args[0] = this;
    while(length > i)args[i + 1] = arguments[i++];
    return apply.call(fn, undefined, args)
  }
}