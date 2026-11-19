// `const { [`Promise`]: MyP } = globalThis` uses a single-quasi template-literal key, which
// is TS-level equivalent to the string-literal form `{ 'Promise': MyP }`. super-class alias
// resolver must accept template keys alongside identifier / string keys so `class C extends MyP`
// still routes its `super.try(...)` through the Promise polyfill
const { [`Promise`]: MyP } = globalThis;
class C extends MyP {
  static run() {
    return super.try(() => 1);
  }
}
