// The array wrapper retains the selected receiver and its own from method.
const userObj = { Array: { from: () => [] } };
const useGlobal = false;
const [, { Array: { from } }] = [0, useGlobal ? globalThis : userObj];
typeof from;
