// a sibling binding keeps the PATTERN alive, but not the hop: the leaf leaves and the emptied
// hop prunes with it, so the sibling reads its own key and nothing reads `inner` twice
const { inner: { [Symbol.iterator]: kept }, keep } = obj;
export { kept };
export { keep };
