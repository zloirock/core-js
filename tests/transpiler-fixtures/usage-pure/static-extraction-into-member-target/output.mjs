import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Iterator$zip from "@core-js/pure/actual/iterator/zip";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
var _ref2;
// a receiver-less static extracted off a call into a MEMBER target: the target takes the polyfill
// like a binding would - beside an instance sibling that reads the call's value, in either order, and
// beside a second member target or a binding, which the residual count sees as surely as a binding
function make() {
  log();
  return _Iterator;
}
function makeArray() {
  log();
  return Array;
}
function makePromise() {
  log();
  return _Promise;
}
const ob = {};
make();
ob.a = _Iterator$from;
let sn;
const _ref = make();
ob.b = _Iterator$concat;
sn = _nameMaybeFunction(_ref);
_ref2 = make(), ob.n = _nameMaybeFunction(_ref2), ob.c = _Iterator$zip, _ref2;
makeArray();
ob.d = _Array$from;
ob.e = _Array$of;
let x;
makePromise();
x = _Promise$try;
ob.f = _Promise$withResolvers;
use(ob, sn, x);