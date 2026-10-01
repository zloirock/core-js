// post-sweep identifier walk with a TS-runtime shadow inside a function body via
// `namespace`. Like `enum Map`, `namespace Map` also creates a runtime binding that
// the standard scope analyses do not expose. Covers the second TS-runtime form
// (namespace, alongside the enum case in `audit-post-sweep-ts-enum-shadow`)
function f() {
  namespace Map {
    export const x = 1;
  }
  return Map.x;
}
