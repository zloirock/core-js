// multi-quasi template literal as computed member key: `arr[`pre${'fix'}`]` should fold
// to 'prefix' when every interpolation resolves to a literal. dynamic-only interpolation
// (no statically-resolvable expression) bails the resolveKey walk and leaves the access
// untouched, with no spurious polyfill emission. distinct prototype methods per line lock
// the per-call dispatch
const arr = [1, 2, 3];
const literalKey = arr[`fla${'t'}`];
literalKey;
const dynamicKey = arr[`pre${runtime}fix`];
dynamicKey;
arr.includes(1);
