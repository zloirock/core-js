// regression lock: a side-effecting computed key resolving to a static (`[(eff(), "from")]: x`)
// alongside a plain static-flatten sibling (`of: y`) - each extracts its own `const`, the SE-key
// renames to a throwaway with the effect kept in place; no duplicate const, no key-rename SyntaxError
let log = [];
const { [(log.push(1), "from")]: x, of: y } = Array;
x([1]);
y(2);
export { log };
