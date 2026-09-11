// `using` declaration + downstream polyfillable method chain. The using scaffolding
// pulls explicit-resource-management polyfills; the .at(-1) on the result of process()
// pulls Array.prototype.at. Both polyfills land independently
function main() {
  using x = getResource();
  return x.process().at(-1);
}
