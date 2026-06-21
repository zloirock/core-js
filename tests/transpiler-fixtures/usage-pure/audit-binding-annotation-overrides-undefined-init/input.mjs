// body inference of `function (): any { return undefined as any; }` resolves to undefined.
// without an overload head, the init walk of `const arr: number[] = opaque()` would leak that
// undefined to `arr` and drop the `.includes()` narrow. the explicit annotation `number[]`
// must override a nullish init type (undefined branch, symmetric with the null branch)
function opaque(): any {
  return undefined as any;
}
const arr: number[] = opaque();
arr.includes(42);
