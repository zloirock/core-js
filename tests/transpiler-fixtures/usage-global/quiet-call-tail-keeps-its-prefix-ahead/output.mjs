import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.concat";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
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
  return o.g, Iterator;
}
function mq() {
  return Promise;
}
let a1, b1;
({
  from: a1,
  of: b1
} = (q = {
  x: 1
}, mp()));
const {
  from: a2,
  concat: b2
} = (q = {
  x: 2
}, mi());
export const {
  try: a3,
  withResolvers: b3
} = (q = {
  x: 3
}, mq());
var a4, b4;
({
  allSettled: a4,
  any: b4
} = (log(typeof a4), mq()));
use(a1, b1, a2, b2, a4, b4);