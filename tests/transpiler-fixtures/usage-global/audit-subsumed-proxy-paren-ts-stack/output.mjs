import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// stacked wrappers `((globalThis as any)!).Symbol.iterator`: TS non-null + as-cast + paren
// layers must unwrap both at the root and at every MemberExpression `.object` slot so the
// chain is recognised as a `globalThis` proxy and the `Symbol.iterator` `in` flattens
function check(x: unknown): boolean {
  return (globalThis as any)!.Symbol.iterator in x;
}