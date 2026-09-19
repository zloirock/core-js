import _at from "@core-js/pure/actual/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `ReturnType<typeof objLiteral.getter>` bails to the GENERIC helper: an object-literal
// ACCESSOR member is not a plain function value (`typeof obj.getter` already reads the
// value type), so treating the getter's function node as the member value would
// over-resolve to a wrong type-specific Maybe and suppress the generic import
const box = {
  get picked() {
    return [1, 2];
  }
};
declare const q: ReturnType<typeof box.picked>;
export const r = _at(q).call(q, 0);

// contrast: a plain METHOD member resolves - the bail is accessor-specific
const box2 = {
  pick() {
    return 'abc';
  }
};
declare const p: ReturnType<typeof box2.pick>;
export const r2 = _atMaybeString(p).call(p, 0);