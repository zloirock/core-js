var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var $isCallable = require('../internals/is-callable');
var inspectSource = require('../internals/inspect-source');

var classRegExp = /^\s*class\b/;
var exec = uncurryThis(classRegExp.exec);

// `Function.isCallable` method
// https://github.com/caitp/TC39-Proposals/blob/trunk/tc39-reflect-isconstructor-iscallable.md
$({ target: 'Function', stat: true, sham: true }, {
  isCallable: function isCallable(argument) {
    // we can't properly detect `[[IsClassConstructor]]` internal slot without `Function#toString` check
    return $isCallable(argument) && !exec(classRegExp, inspectSource(argument));
  }
});
