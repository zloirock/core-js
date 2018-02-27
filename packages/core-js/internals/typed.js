var global = require('../internals/global');
var hide = require('../internals/hide');
var uid = require('../internals/uid');
var TypedArrayConstructorsList = require('../internals/typed-array-constructors-list');
var TYPED = uid('typed_array');
var VIEW = uid('view');
var ABV = !!(global.ArrayBuffer && global.DataView);
var CONSTR = ABV;
var Typed;

for (var NAME in TypedArrayConstructorsList) {
  if (Typed = global[NAME]) {
    hide(Typed.prototype, TYPED, true);
    hide(Typed.prototype, VIEW, true);
  } else CONSTR = false;
}

module.exports = {
  ABV: ABV,
  CONSTR: CONSTR,
  TYPED: TYPED,
  VIEW: VIEW
};
