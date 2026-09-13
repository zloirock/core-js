// A preceding default can replace the source binding while destructuring it.
// The nested guard and later sibling still read the original captured object.
// A constructor escaping through the getter includes its static methods.
let source = {
  leading: undefined,
  get realm() { mark(); return globalThis; },
  trailing: 2,
};
const { leading = (source = { trailing: 'wrong' }, 1), realm: { WeakSet: Value }, trailing } = source;
export { leading, Value, trailing, source };
