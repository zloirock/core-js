// NEGATIVE: a preceding sibling with no exit (a plain side-effect statement) must NOT
// block the lift. the assignment after `log('before')` still runs unconditionally, so
// the narrow is sound and only the string-side polyfill should be emitted. regression
// guard that the preceding-siblings exit check excludes exit-free siblings rather than
// over-firing on all non-empty preceding-sibling lists.
let x = [];
(() => {
  log('before');
  x = 'hello';
})();
x.at(-1);
