// Computed-key destructuring assignments preserve receiver coercion before key effects.
// Sealed and live optional receivers keep their throwing and short-circuit boundaries.
let ca = 0;
let viaSealedAssignSeKey;
({ [(ca++, 'entries')]: viaSealedAssignSeKey } = (globalThis.window?.self).Object);
export { viaSealedAssignSeKey };
export { ca };
