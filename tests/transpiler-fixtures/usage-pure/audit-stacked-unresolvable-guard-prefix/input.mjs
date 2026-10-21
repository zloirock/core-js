// Nested key claims stay inside the source optional branches of repeated realm navigation.
const log = [];
const v = globalThis.window?.window?.[(log.push("k"), "self")]?.Array.of(7).at(0);
use(v, log);
