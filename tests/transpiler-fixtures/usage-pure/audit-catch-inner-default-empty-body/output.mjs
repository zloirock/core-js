// inner-level default value `{ b = 5 }` does NOT trigger catch extraction — the default
// fires natively in the destructure (catch params support nested defaults), and `b`
// itself is a local catch binding with no body usage. extraction would only add `_ref`
// noise. shallow rest / default / computed checks correctly stay at the outer level
try {
  // body intentionally empty
} catch ({
  a: {
    b = 5
  }
}) {
  // empty body
}