// A stored Proxy result must retain instance-method polyfills.
const held = new Proxy(values, handler);
held.findLast(predicate);
