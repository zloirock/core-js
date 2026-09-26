// nested try/catch with destructured catch params at both levels: each catch produces its
// own independent ref binding, with the inner catch's `_ref` getting a cascading suffix
// so the two emissions don't collide
try {
  try {
    inner();
  } catch ({ at }) {
    at(0);
  }
} catch ({ includes }) {
  includes("x");
}
