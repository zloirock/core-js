// Only Array supplies from. Choosing Set leaves the method undefined.
const result = (({ from } = cond ? Array : Set) => from([1, 2]))();
result;
