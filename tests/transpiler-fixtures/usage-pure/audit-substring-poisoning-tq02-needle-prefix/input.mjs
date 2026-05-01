// Lock for TQ-02: identifier `_ref10` containing `_ref` substring within transform-queue
// search range. Multiple chained polyfills produce `_ref`, `_ref2`, ..., `_ref10` UID.
// nth-occurrence math must not match `_ref` inside `_ref10` when looking for the 10th
// `_ref`. Cover via 3 different chained instance methods so each emits distinct import.
const a = arr.flat().at(-1);
const b = arr.flat().at(-1).includes(1);
const c = arr.flat().at(-1).includes(2).toString();
