// multiple polyfilled props in the same outer pattern with sibling rest. each polyfilled
// receiver lands on a distinct `_unused` sentinel; the destructure consumes every key
// (rest still excludes them) and per-extraction polyfill assigns ensure polyfill always wins.
// distinct method names ensure each line maps to a unique import for traceability
let from, fromEntries, rest;
({ Array: { from }, Object: { fromEntries }, ...rest } = globalThis);
