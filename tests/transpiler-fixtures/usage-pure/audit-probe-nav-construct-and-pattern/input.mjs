// two surfaces the probe-nav corpus had never covered: CONSTRUCT positions (the parenthesized
// callee of `new`, a class heritage clause, a `super` static call) and PATTERN defaults (object /
// array / nested / parameter). the nav's value survives into each of them, so the guard render
// has to reach them exactly as it reaches an ordinary receiver
globalThis.ctorBox = {
  Ctor: class {
    constructor(v) {
      this.k = v ?? 'c';
    }
  },
  list: ['ab', 'cd'],
  n: 4,
};
export const newCallee = new (globalThis.window?.self.ctorBox.Ctor)('x').k;
let heldNew;
export const newCalleeAssignRoot = new ((heldNew = globalThis)?.window?.self.ctorBox.Ctor)('y').k;
class Extended extends (globalThis.window?.self.ctorBox.Ctor) {}
export const heritage = new Extended().k;
class WithSuper extends Array {
  static make() {
    return super.of(globalThis.window?.self.ctorBox.n);
  }
}
export const superStatic = WithSuper.make().length;
export { heldNew };

// pattern defaults: the nav only evaluates on the ABSENT path, so its guard must sit inside the
// default rather than around the destructuring
const { missObject = globalThis.window?.self.ctorBox.n } = {};
const [missArray = globalThis.window?.self.ctorBox.list.at(0)] = [];
const { deep: { missNested = globalThis.window?.self.ctorBox.n } = {} } = {};
function withParamDefault({ missParam = globalThis.window?.self.ctorBox.list?.at(0) } = {}) {
  return missParam;
}
export { missObject, missArray, missNested };
export const paramDefault = withParamDefault();

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = ['ab', 'cd'].at(globalThis.window?.self.ctorBox.list ? 0 : 1)?.includes('a');
