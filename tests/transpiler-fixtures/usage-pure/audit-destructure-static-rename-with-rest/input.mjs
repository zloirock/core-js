// rename + rest: `const { from: customFrom, ...rest } = Array;`. body-extract emits
// `const customFrom = _Array$from;` + value renamed to `_unused`. receiver narrowing
// resolves through the alias map for the renamed local name. distinct methods per line
const { from: customFrom, ...rest } = Array;
const xs = customFrom('hi');
xs.at(0);
xs.findLastIndex(p => p);
xs.flat();
