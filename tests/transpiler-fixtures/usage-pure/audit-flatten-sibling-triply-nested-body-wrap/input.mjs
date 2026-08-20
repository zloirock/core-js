// THREE levels of nested arrow bodies, each with instance-method calls that trigger body-
// wraps. only the outermost wrap renders at the top level; inner wraps recursively compose
// into their parent's wrap text. each level emits its own `var _refN;` declaration in
// source-position order
const { Array: { from } } = globalThis, sibling = () => [1].at(0) + ((() => [2].at(0) + ((() => [3].at(0))()))());
console.log(from, sibling());
