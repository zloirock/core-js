import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// three Awaited layers around three Promise layers; final inner type drives narrowing
type T = Awaited<Awaited<Awaited<Promise<Promise<Promise<string[]>>>>>>;
declare const x: T;
_includesMaybeArray(x).call(x, 'a');
_atMaybeArray(x).call(x, 0);
_flatMaybeArray(x).call(x);