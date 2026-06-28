import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _globalThis from "@core-js/pure/actual/global-this";
// SE-tail receiver whose sequence tail is a proxy nav with an effect buried BELOW a hop
// (`(eff(), (track(), globalThis).self).Array.prototype`): the whole tail collapses onto the pure root, so
// every effect must re-emit - the outer prefix AND the one under the `.self` hop. a harvest that peels only
// the outer sequence dropped the buried effect (babel keeps it via its recursive collapse)
let a = 0;
let b = 0;
let c = 0;
let d = 0;
export const flattened = _flatMaybeArray((a++, b++, _globalThis).Array.prototype).call([1, [2]], 1);
export const mapped = _flatMapMaybeArray((c++, d++, _globalThis).Array.prototype).call([1, 2], n => [n]);