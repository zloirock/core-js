import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
// a constructor parameter PROPERTY binds its name in the constructor's scope, which neither tracker
// registers: the binding view stands on the parameter itself, so its annotation types the body read
// - defaulted or not - the way a plain parameter's does. a write to it in the body reaches the read
// like any reassignment, and the read narrows to what was written
export class Defaulted {
  constructor(public a: number[] = [1]) {
    a.at(0);
  }
}
export class Bare {
  constructor(public b: number[]) {
    b.includes(1);
  }
}
export class Written {
  constructor(private c: string[] = []) {
    c = 's';
    c.at(0);
  }
}