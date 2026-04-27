// `{[Symbol.iterator]() {}}` - object literal computed-key method definition.
// the `Symbol.iterator` lookup must polyfill the well-known symbol identifier even
// when used as a method name in an object expression context.
const proto = {
  [Symbol.iterator]() { return [].values(); },
  groupBy(items, fn) { return Map.groupBy(items, fn); }
};
export { proto };
