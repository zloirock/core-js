// A disabled destructuring declaration keeps its environment fallback intact.
// core-js-disable-next-line
const {
  Math: M
} = globalThis.self || globalThis;
consume(M);