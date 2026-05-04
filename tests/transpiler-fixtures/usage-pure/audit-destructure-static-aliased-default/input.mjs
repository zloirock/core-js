// destructure with rename + AssignmentPattern: `const { from: customFrom = () => [] } = Array;`.
// `staticPairFromDestructure` peels AssignmentPattern.left to reach the renamed Identifier
// `customFrom` - matches binding name post-peel. body-extract emits
// `const customFrom = _Array$from === void 0 ? () => [] : _Array$from;` and narrowing
// fires through the registered alias. distinct methods per line
const { from: customFrom = () => [] } = Array;
const xs = customFrom('hi');
xs.at(-1);
xs.includes('h');
xs.flat();
