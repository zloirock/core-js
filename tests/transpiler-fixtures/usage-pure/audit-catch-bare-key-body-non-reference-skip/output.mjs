// catch destructure body-usage check filters Identifiers in non-reference slots
// (method / property names, member-access tails). `class C { includes() {} }` has the
// method-name lexically matching the catch binding but is not a runtime reference.
// Filtering keeps the catch destructure untouched when no real ref exists
try {} catch ({
  includes
}) {
  class C {
    includes() {}
  }
}