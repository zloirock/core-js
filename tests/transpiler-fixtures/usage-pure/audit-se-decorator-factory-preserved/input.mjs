// A decorator factory is invoked at class-eval (`@track()` evaluates `track()` then applies the result),
// so a class carrying one is NOT side-effect-free. When such a class is the discarded head of a sequence
// whose tail is the destructure source, its decorator effect must be preserved, not dropped as pure.
let factoryCalls = 0;
function track() { factoryCalls++; return () => {}; }
const { from } = (class { @track() method() {} }, Array);
export const made = from([1]);
