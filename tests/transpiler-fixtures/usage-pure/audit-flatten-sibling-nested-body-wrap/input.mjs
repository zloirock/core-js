// Single declaration with two declarators: outer flattens `{Array:{from}} = globalThis`,
// sibling is an arrow with nested arrow bodies, each calling `.at(0)` on its own array
// literal. Each arrow body gets its own `var _ref` wrap and both `.at` polyfills emit.
const { Array: { from } } = globalThis, sibling = () => [1].at(0) + ((() => [2].at(0))());
console.log(from, sibling());
