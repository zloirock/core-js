import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Math$f16round from "@core-js/pure/actual/math/f16round";
import _Math$sumPrecise from "@core-js/pure/actual/math/sum-precise";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// an init that RUNS code is evaluated once, before any binding, and the extractions then bind in
// SOURCE order whichever prop empties the host - a declaration, an assignment, a member target, an
// export, a sibling declarator, and behind a sequence or a getter-read prefix
class K {
  static get g() {
    log();
    return 0;
  }
}
function mkArray() {
  log();
  return Array;
}
function mkObject() {
  log();
  return Object;
}
function mkIterator() {
  log();
  return _Iterator;
}
function mkPromise() {
  log();
  return _Promise;
}
function mkMath() {
  log();
  return Math;
}
const ob = {};
mkArray();
const a1 = _Array$from;
const b1 = _Array$of;
let a2, b2;
mkObject();
a2 = _Object$fromEntries;
b2 = _Object$groupBy;
mkIterator();
ob.a = _Iterator$from;
ob.b = _Iterator$concat;
mkPromise();
export const a4 = _Promise$try;
export const b4 = _Promise$withResolvers;
const z5 = 1;
mkMath();
const a5 = _Math$sumPrecise;
const b5 = _Math$f16round;
let a6, b6;
({
  isArray: b6
} = (n++, mkArray()));
a6 = _Array$fromAsync;
K.g, mkPromise();
const a7 = _Promise$allSettled;
const b7 = _Promise$any;
let a8, b8;
K.g, mkObject();
a8 = _Object$entries;
b8 = _Object$hasOwn;
use(a1, b1, a2, b2, ob, a4, b4, z5, a5, b5, a6, b6, a7, b7, a8, b8);