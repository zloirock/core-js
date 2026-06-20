import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a destructured container `const { sub: NS } = lib` binds NS to lib.sub, so `extends NS.Promise`
// resolves through the inner object to the global Promise and super.try rewrites to promise/try
const lib = {
  sub: {
    Promise: _Promise
  }
};
const {
  sub: NS
} = lib;
class C extends NS.Promise {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}