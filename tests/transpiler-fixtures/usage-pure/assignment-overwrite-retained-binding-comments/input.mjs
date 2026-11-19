// A repeated binding read owns no copy of the retained target's comments.
// Keep each annotation once and in source order.
let method;
({ [(effect(), Symbol.iterator)]: /* target annotation */ method = /* default annotation */ fallback() } = globalThis);
