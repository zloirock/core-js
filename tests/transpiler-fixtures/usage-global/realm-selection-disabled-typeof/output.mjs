// A disabled presence selection keeps the fallback for an absent global.
// core-js-disable-next-line
const {
  Math: M
} = typeof self !== "undefined" ? self : globalThis;
consume(M);