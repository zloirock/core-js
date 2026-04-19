import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `globalThis['self'].Promise` - bracket-computed intermediate proxy link.
// `memberPropertyName` helper handles computed StringLiteral / `Literal` (ESTree) keys,
// so the walk still recognises `self` as a POSSIBLE_GLOBAL_OBJECTS member
class C extends _Promise {
  static run(r) {
    return _Promise$try.call(this, r);
  }
}