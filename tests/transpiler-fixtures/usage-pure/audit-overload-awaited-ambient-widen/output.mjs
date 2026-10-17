import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// awaiting an ambient overloaded call folds through the same by-name set as a plain call:
// a divergent rest-armed set WIDENS to the generic helper on both emitters - an ambient
// head's empty body slot must not read as an implicit-undefined return (that fabricated
// receiver suppressed injection entirely on the text-emitter lane)
declare function pa(...xs: string[]): Promise<number[]>;
declare function pa(x: number): Promise<string>;
export async function viaRestDivergent() {
  var _ref;
  return _at(_ref = await pa(5)).call(_ref, 0);
}

// a single ambient head narrows precisely through the awaited unwrap
declare function ps(x: number): Promise<number[]>;
export async function viaSingleHead() {
  var _ref2;
  return _includesMaybeArray(_ref2 = await ps(1)).call(_ref2, 2);
}

// discrete divergent arms arg-match the taken arm before the unwrap
declare function pb(x: number): Promise<number[]>;
declare function pb(x: string): Promise<string>;
export async function viaDiscreteMatch() {
  var _ref3;
  return _atMaybeArray(_ref3 = await pb(5)).call(_ref3, 1);
}