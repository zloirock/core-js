// A block-level `var O;` is a REDECLARATION of the same function-scoped binding, not a shadow and
// not a write - `O` still holds the array literal at the call, so the array variant is correct.
// Both scope trackers nevertheless record the valueless declarator as a constantViolation, which
// is why every value-flow read has to strip it; counting it degraded this to the generic dispatch.
var O = [];
{
  var O;
  O.at(42);
}
