import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// outer mapped's K binding shadows inner mapped's K. alpha-rename guard in
// `applyAliasSubstDeep` clones the subst and drops the inner-K key before recursing into
// the inner mapped's body / nameType, so outer K-substitution doesn't capture into the
// inner binding. without alpha-rename, `Wrap<T>` substitution `K -> 'a'` would propagate
// into Inner's `[K in keyof T]`, corrupting per-key dispatch
type Inner<T> = { [K in keyof T]: T[K] };
type Wrap<T> = { [K in keyof T]: Inner<{
  ['nested_' + K]: T[K];
}> };
declare const r: Wrap<{
  items: number[];
  tail: string[];
}>;
_at(_ref = r.items.nested_items).call(_ref, 0);
_includes(_ref2 = r.tail.nested_tail).call(_ref2, 'a');