// class expression extending `Promise` with a static method using `super.allSettled(...)`:
// the static-method call is rewritten through the polyfilled super constructor.
const C = class extends Promise { static m() { return super.allSettled([]); } };
