// An assignment claim keeps its effectful slot in the original assignment before both method reads.
let at, flat;
({ value: { at, flat } } = { value: (record(), [1]) });
export { at, flat };
