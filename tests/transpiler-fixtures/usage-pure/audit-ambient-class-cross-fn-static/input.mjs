// cross-scope ambient class: `declare class Holder` lives at module scope, then inside an
// enclosing function `Holder.make()` is called whose static return is `string[]`. resolving
// the static must walk up enclosing scopes to reach the module-level declaration. distinct
// methods make each line trace to its declared overload's return shape
declare class Holder {
  static make(): string[];
  static peek(): string;
}
function inner() {
  Holder.make().findLast(s => s);
  Holder.make().at(0);
  Holder.peek().includes('y');
}
inner();
