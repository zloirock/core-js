// findAmbientClassPath cross-scope: `declare class Holder` lives at module scope, then
// inside an enclosing function we reference `Holder.make()` whose static return is
// `string[]`. `findAmbientClassPath` must walk up enclosing scope chains via
// `walkAmbientDeclarationPath`. Methods are distinct so each line traces to the
// declared overload's return shape
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
