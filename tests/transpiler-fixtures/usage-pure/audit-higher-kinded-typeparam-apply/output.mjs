import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `Wrap<F, X> = F<X>` - typeparam F applied to typeparam X (HKT-style). substTypeRefAsType
// returned the bound F (`Array` -> `$Object('Array', null)`) as-is and dropped typeArgs.
// the new `applyHigherKindedArgs` helper rebuilds the bound container with X as inner
// when the binding is a named container with empty inner - parity with the AST-side
// `substTypeReference` -> `withSubstitutedTypeArgs` lane. chained `.at(0)?.at(0)` shows
// the recovery: first hop returns Array<string> (the rebuilt inner), second hop narrows
// on that array. without the apply the inner is null and the second hop bails to generic
type Wrap<F, X> = F<X>;
declare const r: Wrap<Array, string[]>;
null == (_ref = _atMaybeArray(r).call(r, 0)) ? void 0 : _atMaybeArray(_ref).call(_ref, 0);