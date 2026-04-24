// a class extends a polyfillable base and uses rest-pattern spread that downstream
// transforms lower into a helper call. globals referenced by the injected helper code
// (Promise / Array) must also get their pure-mode polyfills emitted, same as any
// hand-written reference to those identifiers
class X extends Promise {
  async m() {
    const arr = [...args];
    return arr.at(0);
  }
}
const p = Promise.resolve(1);
const arr = [1, 2, 3];
arr.at(0);
