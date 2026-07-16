// A mutated `self` lives in its OWN fixture: the mutation pre-pass marks the name mutated for the
// WHOLE file, so every `.self` hop here stops being the pristine realm-local self-reference and the
// collapse machinery must stand down file-wide - mixing these rows into a pristine-hop fixture
// silently rewrites what every other row locks.
globalThis.self = { self: { Array: { prototype: { flat: [].flat } } } };

// The dead-hop descent must NOT skip past a mutated hop: the leaf-nearest anchor stands and the
// mutated value is read through the memo.
let ms;
export const mutatedSelfHop = (ms = globalThis.window)?.self?.self.Array.prototype.flat.call([3, [4]]);

// An unguarded kept root over the mutated hop keeps the hop too.
let mu;
export const mutatedUnguarded = (mu = globalThis.window).self.self.Array.prototype.flat.call([5, [6]]);

// NEGATIVE: a 'self'-spelled hop on a NON-proxy object is no proxy hop at all - stays verbatim.
const selfBox = { self: { self: { Array } } };
export const plainSelfKey = selfBox.self?.self?.Array.of(4);
