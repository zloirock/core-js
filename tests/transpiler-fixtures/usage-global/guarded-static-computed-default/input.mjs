// A known computed static key can also carry a live user default.
// The fallback remains visitable and receives its own instance polyfill.
let M = pickConstructor();
if (!M) M = Array;
const key = 'of';
const { [key]: method = [9].at(0) } = M;
export { method };
