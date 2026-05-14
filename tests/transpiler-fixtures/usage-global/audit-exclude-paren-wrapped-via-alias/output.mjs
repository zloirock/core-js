import "core-js/modules/es.array.at";
// `Exclude<Alias, Target>` where the alias resolves to a paren-wrapped union. The peel
// must apply BOTH before `followTypeAliasChain` (paren around the alias ref - rare) and
// AFTER it (paren inside the alias body - common): `type Mixed = (A | B)` resolves to
// TSParenthesizedType which would skip distribution without the second peel pass.
type Mixed = (string | number[]);
function foo(x: Exclude<Mixed, string>) {
  x.at(-1);
}
foo([1]);