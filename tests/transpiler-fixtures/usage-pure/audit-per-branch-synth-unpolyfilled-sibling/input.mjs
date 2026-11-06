// The local true selector decides Array.from. The unresolved `custom` read still follows the actual
// selected receiver. `constructor-selection-keeps-an-unresolved-sibling` keeps both constructor arms
// and their plain sibling live.
let cond = true;
const r = (({ from, custom } = cond ? Array : Iterator) => [from([1]), custom])();
