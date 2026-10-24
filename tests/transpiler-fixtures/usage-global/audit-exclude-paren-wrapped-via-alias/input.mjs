// `Exclude<Alias, Target>` where the alias resolves to a paren-wrapped union. parens must
// be peeled BOTH before alias resolution (paren around the alias ref - rare) and AFTER it
// (paren inside the alias body - common): `type Mixed = (A | B)` is a TSParenthesizedType
// that would skip distribution without the second peel pass.
type Mixed = (string | number[]);
function foo(x: Exclude<Mixed, string>) {
  x.at(-1);
}
foo([1]);
