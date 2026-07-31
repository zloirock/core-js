// fixtures whose v7 output cannot be expressed as a variant override - currently empty.
// after the babel@8 default migration: babel@8 is the baseline, v7 cosmetic divergences
// live in `output.babel-v7.mjs` siblings, and any v7-only regressions would land here.
// file kept (rather than dropping the BABEL_SKIP default in runner.mjs) so future regressions
// land in one default spot.
// shape: { '<bucket-name>': ['<fixture-path-relative-to-transpiler-fixtures>', ...], ... }
export default {
  // babel@7's generator drops the parens around an optional-chain NEW callee on reprint
  // (`new (q()?.window?.Map)(x)` -> `new q()?.window?.Map(x)`, AST keeps extra.parenthesized -
  // verified on the raw @babel/generator@7.29.7), which @7 then re-parses as
  // `(new q())?.window?.Map(x)` - a SEMANTIC change upstream of this plugin (reproduces with an
  // empty plugin list). the form is isolated in ONE dedicated fixture so every sibling
  // guarded-static form keeps its v7 coverage; the pure twin renders the guard ternary with
  // sound parens and stays covered
  'v7-generator-new-optional-callee': ['usage-global/audit-opaque-root-guarded-ctor'],
};
