// A computed constructor key with a known string receives the pure static unconditionally.
// An unknown runtime key cannot justify that substitution.
const { ['Array']: { from } } = globalThis;
from([1]);
