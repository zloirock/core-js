// A symbol slot passes through beside a nested static in a branch mirror.
// The foreign ternary arm stays native, and a falsy logical arm still yields its own value.
const { [Symbol.iterator]: it, Array: { from: f } } = c ? globalThis : userObj;
it;
f(x);
const { [Symbol.iterator]: it2, Object: { fromEntries: fe = fb } } = c && globalThis;
it2;
fe(y);
