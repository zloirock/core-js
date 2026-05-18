// THREE levels of nested arrow bodies, each with instance-method calls that trigger body-
// wraps. `consumeRefBindingsInRange` collects all three wraps; `findOutermostWraps` returns
// just the outermost (the outer arrow body); `#composeBodyWrapText` recursively composes
// direct descendants - the L1 outer composes L2 middle, which composes L3 innermost. each
// level emits its own `var _refN;` declaration in source-position order
const { Array: { from } } = globalThis, sibling = () => [1].at(0) + ((() => [2].at(0) + ((() => [3].at(0))()))());
console.log(from, sibling());
