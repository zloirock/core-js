// paren-wrapped `(typeof import('foo').Bar)` is preserved as a TSParenthesizedType
// node by oxc (babel strips parens during parsing). isStructuralAnnotation must
// peel the paren before checking the TSTypeQuery / TSImportType nesting; otherwise
// the wrapped structural leaks through to body inference, the `return null as any`
// stub poisons the declared shape, and the polyfill for the cross-module method
// access is silently dropped.
function wrapped(): (typeof import("foo").Bar) {
  return null as any;
}
const x = wrapped();
x.includes(0);
