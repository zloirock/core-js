// exported class with a public static field: any importer can `import { C }; C.count = X`
// for arbitrary X, so the writer set leaves the module and can't be enumerated. field
// candidates are therefore unknown, and dispatch picks the common `instance/at` (array AND
// string) over the Array-narrow `array/instance/at`, valid for any importer-supplied write
export class C {
  static count = [];
  pick() { return C.count.at(0); }
}
