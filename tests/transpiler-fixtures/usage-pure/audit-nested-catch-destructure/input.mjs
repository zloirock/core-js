// Nested try/catch each with destructured params: two independent emitCatchClause
// invocations must not share refs. Inner _ref numbering should cascade (_ref2, _ref3, ...).
try {
  try {
    inner();
  } catch ({ at }) {
    at(0);
  }
} catch ({ includes }) {
  includes("x");
}
