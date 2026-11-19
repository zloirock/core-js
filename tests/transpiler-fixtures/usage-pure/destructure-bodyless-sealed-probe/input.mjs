// The bodyless declaration keeps the sealed receiver's throw before extracting from.
if (enabled) var { from } = (globalThis.window?.self).Array;
use(from);
