// A nullable stored receiver can select its fallback.
// Its store and fallback effects each run once.
let held;
const { resolve } = (held = (note(), globalThis.window))?.Promise || {};
use(resolve, held);
