// A flatten-declaration sibling extracting two instance methods off one global-member receiver: the
// proxy-global root is substituted (no bare globalThis leak) and the receiver memoized into a single
// `_ref` so the substituted member chain is evaluated once, not once per extracted method
const { values, keys } = globalThis.navigator, { Array: { from } } = globalThis;
from([1]);
console.log(values, keys);
