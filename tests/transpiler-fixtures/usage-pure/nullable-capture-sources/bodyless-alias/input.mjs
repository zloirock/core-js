// A bodyless loop capture rejects absence before evaluating its key.
const held = globalThis.window?.Array;
let of;
for (; ({ [(effect(), "of")]: of } = held), false;);
