var aFunction = require('core-js-internals/a-function');
var anObject = require('core-js-internals/an-object');
var nativeApply = (require('core-js-internals/global').Reflect || {}).apply;
var functionApply = Function.apply;

// `Reflect.apply` method
// https://tc39.github.io/ecma262/#sec-reflect.apply
// MS Edge argumentsList argument is optional
require('./_export')({ target: 'Reflect', stat: true, forced: !require('core-js-internals/fails')(function () {
  nativeApply(function () { /* empty */ });
}) }, {
  apply: function apply(target, thisArgument, argumentsList) {
    var T = aFunction(target);
    var L = anObject(argumentsList);
    return nativeApply ? nativeApply(T, thisArgument, L) : functionApply.call(T, thisArgument, L);
  }
});
