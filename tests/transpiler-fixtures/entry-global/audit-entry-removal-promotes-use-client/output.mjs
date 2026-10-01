// The promoted literal is a REAL directive, and the harm is not confined to strict mode: at body
// position 0 `"use client"` makes the module a client boundary for the bundler that reads it.
// Same guard, a module host, a literal whose promotion is observable.
0;
"use client";
export const x = 1;