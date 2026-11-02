// The residual reads the constructor after preserving the nullable holder.
let held;
const { Map: { prototype: proto = fallback() } } = (effect(), (held = globalThis.window).self);
use(proto);
