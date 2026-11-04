// A plain call outside the seal evaluates its argument even when the lookup skipped.
export function read(holder) { return (holder?.list[(key(), Symbol.iterator)])(argument()); }
