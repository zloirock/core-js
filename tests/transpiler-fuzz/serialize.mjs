// Shared, dependency-light serialization for the runtime oracle. Lives apart from harness.mjs so
// the stripped-realm worker can import it WITHOUT pulling in @babel/core (which internally uses some
// of the very builtins the worker strips, and would break under the strip preload).

// stable serialization for runtime comparison: distinguishes undefined / non-finite / bigint /
// function so e.g. `undefined` and `null` never collide
export function serialize(value) {
  return JSON.stringify(value, (key, val) => {
    if (val === undefined) return '__undefined__';
    if (typeof val === 'function') return '__function__';
    if (typeof val === 'bigint') return `${ val }n`;
    if (typeof val === 'number' && !Number.isFinite(val)) return `__${ val }__`;
    return val;
  }) ?? '__undefined__';
}

// a module's observable outcome as a stable string: OK + serialized (r, effects), or ERR + name
export function runtimeKey(result) {
  return result.ok ? `OK|${ serialize(result.r) }|${ serialize(result.effects) }` : `ERR|${ result.errorName }`;
}
