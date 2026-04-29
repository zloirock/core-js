// `(null as any)` and `(null)` - nullish init wrapped in TS as-cast / paren.
// the nullish-init check peels these wrappers so the var-init follower bails on the wrapped
// nullish init and the annotation drives the type instead of the wrapped null.
// peeling exposes the nullish tail to the inference path so downstream picks a
// Maybe variant matching the actual runtime value
export class A {
  x: number[] = (null as any);
  flat() { return this.x.flat(); }
}
export class B {
  y: string[] = (null);
  join() { return this.y.join(','); }
}
