// user namespace with aliased property key: `const NS = { Alt: Promise }; extends NS.Alt`.
// unified resolver walks the object literal, finds `Alt: Promise` entry, recurses on the
// value identifier (Promise -> global). `super.try(...)` routes through the Promise polyfill
const NS = { Alt: Promise };
class C extends NS.Alt {
  static run() { return super.try(() => 1); }
}
