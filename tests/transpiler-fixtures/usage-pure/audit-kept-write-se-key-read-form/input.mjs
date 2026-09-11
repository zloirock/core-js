// the READ form of an SE-carrying claim over a LIVE-optional receiver with a kept write:
// the guard owns the split and the read-form dispatch rides the alternate with the rebuilt
// receiver spelling - its kept key effects run inside it, where the source ran them. no
// other gate reached this arm (mutation-tested blind spot), so this fixture is its lock
let t;
const k = () => 1;
export const v = (t = globalThis.window)?.self[(k(), "Array")].name;
use(v, t);
