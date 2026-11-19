// A method borrowed from an opted-out constructor needs a compatible instance.
// Another method on that instance follows it. Separate constructors and statics
// in this file can still use their own polyfills.
export function read(key) {
  // core-js-disable-next-line
  const Native = Map;
  const shared = new Map();
  shared.set(key, 7);
  const separate = new Map();
  return [
    Native.prototype.has.call(shared, key),
    Map.prototype.get.call(shared, key),
    shared instanceof Map,
    separate.get(key),
    Map.groupBy([key], x => x).get(key),
  ];
}
