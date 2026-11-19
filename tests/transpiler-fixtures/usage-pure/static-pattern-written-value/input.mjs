// A replaced static remains the source of the nested pattern.
Array.from = { length: 19 };
export let length;
({ from: { length = 9 } } = Array);
