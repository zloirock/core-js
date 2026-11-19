// A getter's returned realm is a candidate; keep its read and guard the actual value.
export function direct() {
  const source = { get w() { log(); return globalThis; } };
  return source.w.WeakSet;
}

// A preserved call returning its first argument may change that argument's slots.
function replace(source, key, value) {
  return source[key] = value, source;
}
export function throughCall(key, value) {
  const source = replace({ get w() { log(); return globalThis; } }, key, value);
  return source.w.WeakSet;
}

export function shadowed(globalThis) {
  const source = { get w() { log(); return globalThis; } };
  return source.w.WeakSet;
}

// A realm candidate must not suppress an ordinary instance dispatcher.
export function instance() {
  const source = { get w() { log(); return globalThis; } };
  return source.w.at;
}
