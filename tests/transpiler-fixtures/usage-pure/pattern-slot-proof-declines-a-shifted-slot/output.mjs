import _Error$isError from "@core-js/pure/actual/error/is-error";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// a pattern slot read as PROVEN - a destructured parameter's leaf, a pattern-bound callee, a key or a
// container a call-site pattern write reaches - holds nothing certain where a spread before it may
// shift the slot: each such read stays native, while its unshifted twin resolves
const tail = [];
function leaf([, h]) {
  return h;
}
leaf([...tail, {
  K: _Map
}]).K.groupBy(src, fn);
(leaf([0, {
  K: _Promise
}]), _Promise$try)(fn);
const [, make] = [...tail, () => Array];
make().from(src);
const [, make2] = [0, () => _Iterator];
_Iterator$from(src);
function keys() {
  return [...tail, 'fromEntries'];
}
let key = 'x';
[, key] = keys();
Object[key](src);
function keys2() {
  return [0, 'withResolvers'];
}
let key2 = 'x';
[, key2] = keys2();
_Promise$withResolvers();
function hops() {
  return [...tail, {
    K: Math
  }];
}
let hop = {
  K: Math
};
[, hop] = hops();
hop.K.sumPrecise(src);
function hops2() {
  return [0, {
    K: Error
  }];
}
let hop2 = {
  K: Error
};
[, hop2] = hops2();
_Error$isError(src);