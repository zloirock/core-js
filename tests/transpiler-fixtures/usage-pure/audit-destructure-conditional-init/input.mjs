// destructuring from a ternary whose branches are different global constructors -
// `from` should polyfill via Array, and the `Promise` constructor itself should also polyfill
const { from } = cond ? Array : Promise;
