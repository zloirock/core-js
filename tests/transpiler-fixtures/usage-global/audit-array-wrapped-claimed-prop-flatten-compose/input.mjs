// An array-wrapped pattern combines a static binding, an iterator read and rest.
// Usage-global injects the static and iterator support while retaining the pattern.
// Rest excludes both consumed keys.
const [{ 'from': f, [Symbol.iterator]: it, ...r }] = [Array];
f([1]);
it;
r;
