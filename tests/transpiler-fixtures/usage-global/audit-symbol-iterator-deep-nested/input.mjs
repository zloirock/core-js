// global-mode coverage for symbol-iterator chains. Symbol.iterator inside computed-key
// member access requires polyfill; the side-effect-free Symbol receiver doesn't shadow
const obj = {
  *[Symbol.iterator]() { yield 1; yield 2; },
};
for (const v of obj) console.log(v);
