// a computed destructure key `const { [k]: MyP } = R` (k resolves to "Promise") binds MyP to
// R.Promise, so extends MyP resolves to the global Promise and super.try rewrites to promise/try
const k = "Promise";
const R = { Promise };
const { [k]: MyP } = R;
class C extends MyP {
  static run() { return super.try(() => 1); }
}
