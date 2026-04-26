import _at from "@core-js/pure/actual/instance/at";
// exported class with public static field: any importer can `import { C }; C.count = X`
// for arbitrary X. the writer set leaves the module - we cannot enumerate it.
// `collectClassFieldCandidates` returns null (unknown) for public fields of exported
// classes, so polyfill dispatch picks the common `instance/at` (handles array AND string)
// instead of the Array-narrow `array/instance/at` that would crash on a string write
export class C {
  static count = [];
  pick() {
    var _ref;
    return _at(_ref = C.count).call(_ref, 0);
  }
}