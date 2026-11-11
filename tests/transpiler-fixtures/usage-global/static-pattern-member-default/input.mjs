// A pattern-valued static keeps its inner default and member write.
export const box = {};
({ from: { length: box.length = 9 } } = Array);
