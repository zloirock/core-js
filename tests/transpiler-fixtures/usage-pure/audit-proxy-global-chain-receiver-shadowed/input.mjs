// shadowed proxy-global - the parameter binding makes `globalThis` a local value, not the
// runtime root. polyfill must NOT substitute the leaf since the user's value is whatever
// caller passes; only the polyfillable instance method `.includes` gets emitted
function fn(globalThis) {
  return globalThis?.foo?.includes(1);
}
