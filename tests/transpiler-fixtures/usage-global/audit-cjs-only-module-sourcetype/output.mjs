require("core-js/modules/es.array.at");
// `sourceType: 'module'` by default, but body has no ESM markers and uses CJS assigns;
// pre() must detect CJS via `detectCommonJS` and emit `require()` statements, not imports
module.exports = {
  items: [].at(-1)
};