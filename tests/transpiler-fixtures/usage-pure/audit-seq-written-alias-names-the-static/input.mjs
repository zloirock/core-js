// the receiver an alias names is the same receiver whatever spelling the source uses for it: an
// alias WRITTEN in the sequence that reads it names the realm exactly as the bare global does, so
// the static above it polyfills instead of reading raw off the host. the guarded read below is the
// other half - the guard test evaluates the receiver, so its writes run there and not a second time
// ahead of it
let alias;
let stored;
export const named = (alias = globalThis, stored = alias.window?.self).Number.MAX_SAFE_INTEGER;
export const bare = (stored = globalThis.window?.self).Number.MAX_SAFE_INTEGER;
export const guarded = (alias = globalThis, stored = alias.window?.self)?.Promise.noSuchStatic;
