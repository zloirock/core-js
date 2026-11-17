import _Array$of from "@core-js/pure/actual/array/of";
// The of static has no import supplied by loop syntax; this isolates the pattern claim.
for (const {
  [(eff(), 'of')]: viaSeKey
} of [{
  of: _Array$of
}]) viaSeKey([]);