// an enum member initialized by a comparison yields a runtime BOOLEAN regardless of
// operand kinds (invalid TS, but a non-type-checking parse still transforms) - no string narrow
// @ts-expect-error an enum member tsc refuses is the shape under test
enum E {
  C = 'a' < 'b'
}