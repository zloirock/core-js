// An array receiver containing a call is evaluated once before either binding.
// The first instance read precedes the computed sibling key, and both use the same receiver.
// An effect inside a literal is still an effect that must not be duplicated.
function key() { return 'k'; }
function fn() { return 1; }

const { at, [key()]: picked } = [fn()];
at();
export const out = picked;
