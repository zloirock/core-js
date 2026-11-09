// A nested IIFE pattern mirrors the static and keeps the nullable alias read.
const w = globalThis.window;
(({ resolve: { length } }) => length)(w.Promise);
