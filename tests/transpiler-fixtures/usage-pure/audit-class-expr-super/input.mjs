// class expression extending a polyfilled built-in with `super.method(...)`: the
// static-method dispatch routes through the pure-mode polyfilled super.
const C = class extends Promise { static m() { return super.allSettled([]); } };
