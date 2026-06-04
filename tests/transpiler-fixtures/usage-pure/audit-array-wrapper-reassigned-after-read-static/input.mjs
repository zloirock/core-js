// The wrapper is reassigned only AFTER the destructuring read, so the read still sees the original
// `[Array]` snapshot and resolves the static method; the later write doesn't poison it
let w = [Array];
const [{ from }] = w;
from([1]);
w = [];
