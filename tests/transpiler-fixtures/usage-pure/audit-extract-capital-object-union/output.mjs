import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// capital `Object` is the boxed-top type: `string extends Object` is TRUE in TS, so
// `Extract<string | number[], Object>` keeps BOTH arms and the cross-family union stays
// generic - dropping the primitive arm narrowed to an array Maybe on a runtime string
declare const viaCapitalInput: Extract<string | number[], Object>;
export const viaCapital = _at(viaCapitalInput).call(viaCapitalInput, 0);

// the lowercase `object` keyword rejects primitives - the array arm survives alone
declare const viaLowerInput: Extract<string | number[], object>;
export const viaLowercase = _includesMaybeArray(viaLowerInput).call(viaLowerInput, 1);