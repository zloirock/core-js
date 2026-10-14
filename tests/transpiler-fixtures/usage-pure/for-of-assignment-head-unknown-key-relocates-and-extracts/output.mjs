import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
// A for-of head that ASSIGNS mirrors each claim into the iterated element. A computed key naming no
// known slot stops that mirror, so the head relocates into the body, where the static claim beside the
// key extracts and the residual keeps the key - an object hop and a realm hop alike; unplugin reads that
// residual through the collapsed hop (sidecar).
let from, trunc, other;
const key = pick();
for (const _ref of [{
  w: Array
}]) {
  ({
    w: {
      [key]: other
    }
  } = _ref);
  from = _Array$from;
  break;
}
for (const _ref2 of [_globalThis]) {
  ({
    [key]: other
  } = _globalThis.Math);
  trunc = _Math$trunc;
  break;
}
export { from, trunc, other };