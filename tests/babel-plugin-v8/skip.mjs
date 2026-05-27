// fixtures whose v8 output cannot be expressed as a baseline match - currently empty
// after the babel@8 migration pass: cosmetic divergences live in `output.babel-v8.mjs`
// siblings, semantic regressions were fixed in plugin source. file kept (rather than
// removing BABEL_SKIP from package.json) so future regressions land in one default spot.
// shape: { '<bucket-name>': ['<fixture-path-relative-to-transpiler-fixtures>', ...], ... }
export default {};
