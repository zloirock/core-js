var _at = require("@core-js/pure/actual/instance/at");
module.exports = function read(u: number[]) {
  ++(u as any);
  arguments[0] = 'ab';
  return _at(u).call(u, -1);
};