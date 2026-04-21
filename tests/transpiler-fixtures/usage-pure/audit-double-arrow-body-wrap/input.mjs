// nested arrow expression bodies, each with an instance-method chain needing `_ref`
// memoization. `normalizeArrowRefParams` post-pass undoes `scope.push`'s param fallback
// — see `import-injector.js` for why in-visit block-convert races with sibling replaceWith
const g = x => (y => x.at(y).flat())(0);
