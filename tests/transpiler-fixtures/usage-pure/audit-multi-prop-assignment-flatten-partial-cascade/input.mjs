// destructure assignment with one polyfill-eligible and one opaque outer prop. the
// polyfill extracts; the opaque prop stays in the residual destructure (with a polyfilled
// receiver); the host statement survives because the residual still has a consumer
let from, x;
({ Array: { from }, custom: { x } } = globalThis);
