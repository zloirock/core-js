var fails = require('./fails');

module.exports = fails(function () {
  // babel-minify transpiles RegExp('.', 'g') -> /./g and it causes SyntaxError
  return RegExp('(?<a>b)', (typeof '').charAt(5)).exec('b').groups.a !== 'b';
});
