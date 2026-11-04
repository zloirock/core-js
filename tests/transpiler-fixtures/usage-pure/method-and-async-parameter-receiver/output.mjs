import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// Method arity and parameter types survive the receiver capture.
export class Read {
  declare last?: number;
  set value(_ref: number[]) {
    let at = _atMaybeArray(_ref);
    this.last = at.call([3, 5], -1);
  }
  async read(_ref2: number[]) {
    let at = _atMaybeArray(_ref2);
    return at.call([7], await _Promise$resolve(-1));
  }
}