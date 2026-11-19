// destructure from a ternary whose branches are different global constructors. each branch
// is handled independently: `Array` becomes a fresh object literal with the `Array.from`
// polyfill; `Promise` is replaced with the constructor polyfill (no static `Promise.from`)
const { from } = cond ? Array : Promise;
