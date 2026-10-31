import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// an optional-chained SAFE method keeps the precision - the optional lowering must not
// degrade a registry-known non-mutating call into an unknown one
const opted = [[1], [2]];
opted == null ? void 0 : _includesMaybeArray(opted).call(opted, 9);