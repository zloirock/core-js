import _globalThis from "<CWD>/packages/core-js-pure/actual/global-this.js";
_globalThis.Array.from = replacement;
use(_globalThis.Array.from([7]));
const {
  Array: {
    from
  }
} = _globalThis;
use(from);