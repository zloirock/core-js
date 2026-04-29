// exported class with public static field: any importer can `import { C }; C.count = X`
// for arbitrary X. the writer set leaves the module - we cannot enumerate it.
// `collectClassFieldCandidates` returns null (unknown) for public fields of exported
// classes, so polyfill dispatch picks the common `instance/at` (handles array AND string)
// rather than the Array-narrow `array/instance/at`, keeping the call valid for any
// importer-supplied write
export class C {
  static count = [];
  pick() { return C.count.at(0); }
}
