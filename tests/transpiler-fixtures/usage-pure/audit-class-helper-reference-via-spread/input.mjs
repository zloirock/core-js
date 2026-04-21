// A class extends a polyfillable base and uses rest-pattern spread that babel transpiles
// to `_toArray`. After helper injection, programExit re-traverses new body nodes. Map /
// Promise references in newly-injected helper code must still polyfill (usage-pure sweep).
class X extends Promise {
  async m() {
    const arr = [...args];
    return arr.at(0);
  }
}
const p = Promise.resolve(1);
const arr = [1, 2, 3];
arr.at(0);
