// fixtures whose v7 output cannot be expressed as a variant override - currently empty.
// after the babel@8 default migration: babel@8 is the baseline, v7 cosmetic divergences
// live in `output.babel-v7.mjs` siblings, and any v7-only regressions would land here.
// file kept (rather than removing BABEL_SKIP from package.json) so future regressions
// land in one default spot.
// shape: { '<bucket-name>': ['<fixture-path-relative-to-transpiler-fixtures>', ...], ... }
export default {};
