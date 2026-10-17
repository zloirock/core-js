function throughFinally() {
  try { throughFinally.touched = true; } finally { var { asyncIterator: fin } = Symbol; }
  return [][fin];
}
export const viaFinally = throughFinally();
