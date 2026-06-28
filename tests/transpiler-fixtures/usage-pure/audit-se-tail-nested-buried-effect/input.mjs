// SE-tail receiver whose sequence tail is a proxy nav with an effect buried BELOW a hop
// (`(eff(), (track(), globalThis).self).Array.prototype`): the whole tail collapses onto the pure root, so
// every effect must re-emit - the outer prefix AND the one under the `.self` hop. a harvest that peels only
// the outer sequence dropped the buried effect (babel keeps it via its recursive collapse)
let a = 0;
let b = 0;
let c = 0;
let d = 0;
export const flattened = ((a++, (b++, globalThis).self).Array.prototype).flat.call([1, [2]], 1);
export const mapped = ((c++, (d++, globalThis).self).Array.prototype).flatMap.call([1, 2], n => [n]);
