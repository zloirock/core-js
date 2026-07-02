// A consumed shorthand binding in a nested destructure is body-extracted to a const, so its slot
// must be neutralized to a sentinel that KEEPS the original key (`{ at: _unused }`), not a shorthand
// `{ _unused }` (which reads `m._unused` and skips the real `m.at`). the surviving computed-key
// sibling memoizes the constant-literal receiver into one `_ref` so the extract does not re-emit it.
function key() { return 'k'; }

const { m: { at }, [key()]: picked } = { m: [1], k: 2 };
at();
export const out = picked;
