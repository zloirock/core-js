// Source pass over a class with async and spread. A separate phase test lowers the class
// between hooks and checks the polyfill used by the emitted async helper.
class X extends Promise {
  async m() {
    const arr = [...args];
    return arr.at(0);
  }
}
const p = Promise.resolve(1);
const arr = [1, 2, 3];
arr.at(0);
