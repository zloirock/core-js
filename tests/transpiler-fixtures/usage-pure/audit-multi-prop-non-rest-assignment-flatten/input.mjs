// nested proxy-global destructure assignment with two outer props and no rest spread.
// both inner names (Array.from, Object.fromEntries) are polyfill-eligible; each assignment
// must emit independently; the empty destructure is removed (no consumers left)
let from, fromEntries;
({Array: {from}, Object: {fromEntries}} = globalThis);
