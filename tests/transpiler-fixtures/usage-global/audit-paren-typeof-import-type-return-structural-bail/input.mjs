// paren-wrapped `(typeof import('foo').Bar)` is kept as a TSParenthesizedType by oxc
// (babel strips parens at parse). the structural bail must peel the paren before seeing
// the TSTypeQuery / TSImportType nesting; otherwise the `return null as any` stub leaks
// into body inference, poisons the declared shape, and drops the cross-module polyfill.
function wrapped(): (typeof import("foo").Bar) {
  return null as any;
}
const x = wrapped();
x.includes(0);
