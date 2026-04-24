// user namespace with aliased property key: `const NS = { Alt: Promise }; extends NS.Alt`.
// unified resolver walks the ObjectExpression, finds `Alt: Promise` entry, recurses on the
// value Identifier (Promise -> global). `super.try(...)` routes through the Promise polyfill
const NS = { Alt: Promise };
class C extends NS.Alt {
  static run() { return super.try(() => 1); }
}
