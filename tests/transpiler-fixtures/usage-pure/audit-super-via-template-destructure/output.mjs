import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `const { [`Promise`]: MyP } = globalThis` uses a single-quasi template-literal key, which
// is TS-level equivalent to the string-literal form `{ 'Promise': MyP }`. super-class alias
// resolver must accept template keys alongside identifier / string keys so `class C extends MyP`
// still routes its `super.try(...)` through the Promise polyfill
const MyP = _Promise;
class C extends MyP {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}