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
function withParamDefault({ missParam = globalThis.window?.self.ctorBox.list?.at(0) } = {}) {
  return missParam;
}
export const paramDefault = withParamDefault();
