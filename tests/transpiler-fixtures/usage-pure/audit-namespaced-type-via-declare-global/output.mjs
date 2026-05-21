import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `declare global { namespace NS { type Items = ... } }` - globally-augmented namespace.
// walkStatementsForDecl's `decl.global` branch only fired for bare-name lookups
// (`rest.length===0`); qualified `NS.Items` skipped it. relaxed: descend `declare global`
// body regardless of segment depth so qualified lookups through global augmentation hit
declare global {
  namespace NS {
    type Items = string[];
  }
}
declare const r: NS.Items;
_atMaybeArray(r).call(r, 0);
export {};