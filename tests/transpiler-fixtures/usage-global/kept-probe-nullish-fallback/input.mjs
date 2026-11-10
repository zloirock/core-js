// A nullish selection keeps a nullable stored left and the fallback arm.
let held, from;
({ from } = (held = globalThis.window)?.Array ?? {});
use(from, held);
