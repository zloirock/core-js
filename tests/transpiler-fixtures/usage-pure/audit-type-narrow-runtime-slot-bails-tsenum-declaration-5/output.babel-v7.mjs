// a member referencing another member is unresolvable per se, but coercing arithmetic
// still yields a KNOWN number - the string method must not inject
enum E5 {
  A = 1,
  B = A * 2,
}