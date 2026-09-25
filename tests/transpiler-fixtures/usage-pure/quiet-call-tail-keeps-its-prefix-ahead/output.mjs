import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// a sequence prefix ahead of a CALL tail runs before the call even where the rescue canon calls the
// callee quiet - the callee may read what the prefix wrote (`q.x`) or observe it through a getter -
// so a host the statics empty keeps prefix and call in source order, as one init: an assignment, a
// declaration, an export, and a `var` the prefix itself reads
const o = {
  get g() {
    log();
    return 1;
  }
};
function mp() {
  return q.x, Array;
}
function mi() {
  return o.g, _Iterator;
}
function mq() {
  return _Promise;
}
let a1, b1;
q = {
  x: 1
}, mp();
a1 = _Array$from;
b1 = _Array$of;
q = {
  x: 2
}, mi();
const a2 = _Iterator$from;
const b2 = _Iterator$concat;
q = {
  x: 3
}, mq();
export const a3 = _Promise$try;
export const b3 = _Promise$withResolvers;
var a4, b4;
log(typeof a4), mq();
a4 = _Promise$allSettled;
b4 = _Promise$any;
use(a1, b1, a2, b2, a4, b4);