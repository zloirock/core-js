// computed-string destructure key: `const { ['Promise']: MyP } = globalThis`. semantically
// identical to shorthand `{ Promise: MyP }`. plugin recognises StringLiteral key value
// alongside Identifier keys, so the alias chain still routes super.try through Promise
const { ['Promise']: MyP } = globalThis;
class C extends MyP {
  static run() { return super.try(() => 1); }
}
