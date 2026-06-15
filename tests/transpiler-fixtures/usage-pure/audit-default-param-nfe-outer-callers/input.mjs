// a named function expression is called externally by its outer binding name, not its internal name.
// checking only the internal name sees its ~0 recursion sites and misses the external call, narrowing
// the param to the default's type - a foreign caller arg then hits the array-specific helper and throws
// on ie:11. the first NFE is overridden by an external call (stays generic); the second is never
// overridden (keeps the array-specific narrow).
const overridden = function impl(x = [1, 2]) { return x.at(0); };
overridden("hello");
const pinned = function impl2(y = [1, 2]) { return y.includes(1); };
pinned();
