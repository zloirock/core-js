// `(null as any)` and `(null)` - nullish init wrapped in TSAsExpression / paren.
// `isNullishInit` peels these wrappers so `followableVarInit` correctly bails on
// the wrapped nullish init (annotation drives the type instead of the wrapped null).
// without peel, the wrappers hid the nullish-tail from the inference path - downstream
// could pick a non-Maybe variant when the runtime value is actually null
export class A {
  x: number[] = (null as any);
  flat() { return this.x.flat(); }
}
export class B {
  y: string[] = (null);
  join() { return this.y.join(','); }
}
