// Computed single-quasi template-literal access on a string enum (`` E[`Alpha`] ``).
// same effective key as `E['Alpha']` but a distinct AST shape (TemplateLiteral with one
// quasi, no expressions). the narrow must stay consistent across `.A` / `['A']` / `` [`A`] ``
// access shapes, treating the single quasi as a plain string key. distinct methods
// (.padEnd / .trimStart) per slot pin emission to the narrowed string member; a regression
// that ignores the single-quasi key would over-emit array siblings.
enum Codes { Ok = 'ok', Fail = 'fail' }
function probe() {
  Codes[`Ok`].padEnd(8, '.');
  Codes[`Fail`].trimStart();
}
probe();
