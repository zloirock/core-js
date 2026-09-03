import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// a constructor parameter PROPERTY binds its name in the constructor's scope, which neither tracker
// registers: the binding view stands on the parameter itself, so its annotation types the body read
// - defaulted or not - the way a plain parameter's does. a write to it in the body reaches the read
// like any reassignment, and the read narrows to what was written
export class Defaulted {
  constructor(public a: number[] = [1]) {
    _atMaybeArray(a).call(a, 0);
  }
}
export class Bare {
  constructor(public b: number[]) {
    _includesMaybeArray(b).call(b, 1);
  }
}
export class Written {
  constructor(private c: string[] = []) {
    c = 's';
    _atMaybeString(c).call(c, 0);
  }
}