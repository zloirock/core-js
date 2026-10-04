import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// TS `satisfies` cast on a receiver feeding an instance call: the cast is peeled and
// the call recognised as a polyfill site.
_includesMaybeArray(arr satisfies number[]).call(arr satisfies number[], 1);
_atMaybeArray(arr satisfies number[]).call(arr satisfies number[], -1);