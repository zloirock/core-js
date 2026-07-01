import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// type-alias decl inside a StaticBlock - the type-decl lookup used to walk only
// TSModuleBlock-typed nodes via the lookup-path stack, so a local-scope alias declared
// inside `static { ... }` was invisible to the lookup. extended to Program / BlockStatement
// / StaticBlock so block-scoped decls resolve through their containing block
class Holder {
  static {
    type Items = string[];
    declare const r: Items;
    _atMaybeArray(r).call(r, 0);
  }
}
Holder;