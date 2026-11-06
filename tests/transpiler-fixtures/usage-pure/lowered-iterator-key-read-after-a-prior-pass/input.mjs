// A read keyed by a prior pass's `symbol/iterator` import is a lowered pattern key, not this
// plugin's own render: the iterator method's render is the helper, so the read takes it on this
// pass exactly as `[Symbol.iterator]` does. A write, a delete, a `super` read and another
// well-known symbol keep the spelling the prior pass chose.
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
export function read(_ref) {
  var iter = _ref[_Symbol$iterator];
  var called = _ref[_Symbol$iterator]();
  return [iter, called];
}
export function write(target, fn) {
  target[_Symbol$iterator] = fn;
  delete target[_Symbol$iterator];
  return target[_Symbol$asyncIterator];
}
export class Sub extends Array {
  read() { return super[_Symbol$iterator]; }
}
// The require spelling of the same binding, which the require import style leaves for a later pass.
var _Symbol$iteratorRequired = require("@core-js/pure/actual/symbol/iterator");
export function readRequired(_ref) {
  return _ref[_Symbol$iteratorRequired];
}
