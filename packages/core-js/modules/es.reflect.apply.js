// 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
var aFunction = require('core-js-internals/a-function');
var anObject = require('core-js-internals/an-object');
var rApply = (require('core-js-internals/global').Reflect || {}).apply;
var fApply = Function.apply;
// MS Edge argumentsList argument is optional
require('./_export')({ target: 'Reflect', stat: true, forced: !require('core-js-internals/fails')(function () {
  rApply(function () { /* empty */ });
}) }, {
  apply: function apply(target, thisArgument, argumentsList) {
    var T = aFunction(target);
    var L = anObject(argumentsList);
    return rApply ? rApply(T, thisArgument, L) : fApply.call(T, thisArgument, L);
  }
});
