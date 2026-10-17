import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// an IDENTITY-IIFE root (`((x) => x)(globalThis)`) proves through the identity-param inline
// canon: the buried global substitutes, the live window test guards the chain, the branch
// reads the ponyfill leaf (only the arrow reprint differs between emitters)
export const viaIdentityRoot = null == (x => x)(_globalThis)?.window ? void 0 : _atMaybeArray(_ref = _Array$of(24)).call(_ref, 0);