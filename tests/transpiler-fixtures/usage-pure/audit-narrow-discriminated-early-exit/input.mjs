// discriminated union narrow via early-exit: `if (x.kind !== 'a') return;` excludes the
// 'b' branch for the rest of the function body. the subsequent `x.val.at(0)` must see the
// 'a' branch's `string[]` type and emit the Array-specific instance.at polyfill
type X = { kind: 'a'; val: string[] } | { kind: 'b'; val: number };
function f(x: X) {
  if (x.kind !== 'a') return;
  x.val.at(0);
}
