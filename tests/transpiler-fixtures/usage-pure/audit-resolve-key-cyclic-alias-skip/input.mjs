// Cyclic alias `const a = b; const b = a` used as a computed key terminates safely.
// Plugin falls back to polyfilling the bare `Symbol` (no specialized `Symbol.X` resolution).
const a = b;
const b = a;
Symbol[a] in obj;
