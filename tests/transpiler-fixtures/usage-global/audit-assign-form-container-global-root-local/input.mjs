const local = { Array: { of: x => x } };
let box;
[box] = [local];
export const result = box.Array.of(3);
