import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// computed-string destructure key: `const { ['Promise']: MyP } = globalThis`. semantically
// identical to shorthand `{ Promise: MyP }`. plugin recognises StringLiteral key value
// alongside Identifier keys, so the alias chain still routes super.try through Promise
const MyP = _Promise;
class C extends MyP {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}