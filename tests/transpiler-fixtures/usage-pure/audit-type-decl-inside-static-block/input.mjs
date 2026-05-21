// type-alias decl inside a StaticBlock - findTypeDeclInLookupPath used to walk only
// TSModuleBlock-typed nodes via the lookup-path stack, so a local-scope alias declared
// inside `static { ... }` was invisible to the lookup. extended to Program / BlockStatement
// / StaticBlock so block-scoped decls resolve through their containing block
class Holder {
  static {
    type Items = string[];
    declare const r: Items;
    r.at(0);
  }
}
Holder;
