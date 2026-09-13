import _Array$from from "@core-js/pure/actual/array/from";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Object-rest keeps the affected method slots native; computed symbol keys still polyfill.
// Independent reads and key/default expressions still receive their own polyfills.
class A extends Array {
  static f() {
    const {
      [_Symbol$iterator]: iter,
      ...rest
    } = _Array$from.call(this, []);
  }
}