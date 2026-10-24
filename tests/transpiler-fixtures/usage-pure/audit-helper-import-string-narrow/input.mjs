// type-narrowed string-only `at` should pick `_atMaybeString` (not generic `_at`)
// when the operand is annotated as a string. tests the helper-import dispatch picks
// the maybe-variant matching the receiver type.
function fn(s: string) { return s.at(0); }
