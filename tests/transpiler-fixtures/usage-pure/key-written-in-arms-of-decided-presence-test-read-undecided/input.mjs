let undecided;
if (flag) undecided = 'values';
else undecided = Symbol.iterator;
export const readUndecided = receiver => receiver[undecided];
