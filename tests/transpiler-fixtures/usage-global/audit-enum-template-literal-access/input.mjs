// Computed single-quasi template-literal access on a string enum (`` E[`Alpha`] ``).
// Same effective key as `E['Alpha']` but a distinct AST shape (TemplateLiteral with
// one quasi, no expressions). enumMemberKeyName routes through `singleQuasiString` -
// shared with `getMemberProperty`'s computed-key resolver - so the narrow stays
// consistent across `.A` / `['A']` / `` [`A`] `` access shapes. distinct methods
// (.padEnd / .trimStart) per slot pin emission to the narrowed string member -
// without the singleQuasiString branch both methods over-emit array siblings
enum Codes { Ok = 'ok', Fail = 'fail' }
function probe() {
  Codes[`Ok`].padEnd(8, '.');
  Codes[`Fail`].trimStart();
}
probe();
