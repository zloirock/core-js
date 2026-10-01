// async method using `super.resolve(...)` on an extended `Promise`: the super-call
// rewrite emits the pure-mode polyfilled static through the parent constructor.
class C extends Promise { static async m() { return super.resolve(1); } }
