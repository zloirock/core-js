// The unbraced if keeps the dispatch in its expression statement. Its receiver temporary
// belongs to the surrounding function and is assigned only when the condition holds.
const { from } = ((() => {
  if (Math.random() < 0) [1, 2, 3].at(0);
  return Array;
})(), Array);
console.log(from);
