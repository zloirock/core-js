// a computed static key `[(se, 'name')]` folding to a pure static, reached THROUGH an outer instance
// guard (a trailing `.at` / `.includes` / `.toFixed` dispatch memoizes the root). the outer guard owns
// the root's nullability + receiver SE, so the static emits BARE into its body regardless of the root
// value's own definedness - the computed-KEY effect the guard does not own rides ahead of the pure
// static (`(c++, _Array$from)`). three root shapes each reach the collapse through a distinct path:
//   - an ALIAS-assign root (`w = g`, defined) - verdict 'erase'
//   - a PROXY-NAV-assign root (`v = globalThis.window`, an undefinable window hop) - verdict 'guard',
//     moot under the outer guard; without this the static stayed raw `_ref.Array[(d++, 'of')]` (native,
//     missed polyfill on ie11)
//   - a SEQUENCE root (`(e++, u = globalThis.window)`) whose ctor-static leaf folds its key SE too
// distinct static + instance method per line.
let w;
let v;
let u;
const g = globalThis;
let c = 0;
let d = 0;
let e = 0;
let f = 0;
export const aliasComputed = (w = g)?.Array[(c++, 'from')]([1]).at(0);
export const proxyNavComputed = (v = globalThis.window)?.Array[(d++, 'of')](5).includes(1);
export const seqCtorStaticComputed = ((e++, u = globalThis.window))?.Number[(f++, 'MAX_SAFE_INTEGER')].toFixed(2);
