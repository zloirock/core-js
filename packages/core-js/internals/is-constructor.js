/* eslint-disable es/no-proxy -- safe */
var fails = require('../internals/fails');
var classof = require('../internals/classof');
var inspectSource = require('../internals/inspect-source');

var classRegExp = /^\s*class\b/;
var functionRegExp = /^\s*function\b/;
var exec = classRegExp.exec;
var INCORRECT_TO_STRING = !functionRegExp.exec(function () { /* empty */ });

var isConstructorModern = function (argument) {
  if (typeof argument !== 'function') return false;
  try {
    // eslint-disable-next-line no-new -- required for testing */
    new new Proxy(argument, {
      construct: function () { /* empty */ }
    })();
    return true;
  } catch (error) {
    return false;
  }
};

var isConstructorLegacy = function (argument) {
  if (typeof argument !== 'function') return false;
  switch (classof(argument)) {
    case 'AsyncFunction':
    case 'GeneratorFunction':
    case 'AsyncGeneratorFunction': return false;
  }
  if (INCORRECT_TO_STRING) return true;
  var string = inspectSource(argument);
  // we can't check .prototype since constructors produced by .bind haven't it
  return !!exec.call(functionRegExp, string) || !!exec.call(classRegExp, string);
};

// `IsConstructor` abstract operation
// https://tc39.es/ecma262/#sec-isconstructor
module.exports = fails(function () {
  return !isConstructorModern(Proxy) || isConstructorModern({});
}) ? isConstructorLegacy : isConstructorModern;
