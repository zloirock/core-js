// A nested native pattern reads before its instance claim, even after the preceding
// outer claim has been extracted. Both methods retain their own source reads.
function read(box) {
  let includes, q, at;
  ({ includes, y: { other: { q }, at } } = box);
  return [includes, q, at];
}
export { read };
