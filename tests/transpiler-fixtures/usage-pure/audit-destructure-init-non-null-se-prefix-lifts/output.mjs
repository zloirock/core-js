import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A TypeScript non-null wrapper preserves the sequence effect before its static binding.
declare function auditCall(): void;
const {
  Promise: {
    resolve
  }
} = (auditCall(), {
  Promise: {
    resolve: _Promise$resolve
  }
})!;
resolve(1);