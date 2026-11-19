import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A class constraint is resolved at its declaration, before caller-local aliases.
type Mode = 'lines' | 'text';
class Box<T extends Mode> {
  constructor(value: T) {}
  get(): T extends 'lines' ? number[] : string {
    return null as any;
  }
}
export function last() {
  var _ref;
  type Mode = {};
  return _atMaybeArray(_ref = new Box('lines').get()).call(_ref, -1);
}