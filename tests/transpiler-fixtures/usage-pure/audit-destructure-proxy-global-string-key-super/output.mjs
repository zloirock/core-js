import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
const MyP = _Promise;
class C extends MyP {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}
C.run();