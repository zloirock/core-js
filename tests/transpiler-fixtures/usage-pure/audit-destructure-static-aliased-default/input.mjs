// destructure with rename + default: `const { from: customFrom = () => [] } = Array`.
// the rename + default combination must still register `customFrom` as an Array.from
// alias so the call's return narrows; distinct instance methods per line lock that
const { from: customFrom = () => [] } = Array;
const xs = customFrom('hi');
xs.at(-1);
xs.includes('h');
xs.flat();
