var _Array$from = require("@core-js/pure/actual/array/from");
module.exports = async function () {
  const mod = await import('./worker.mjs');
  return _Array$from(mod.rows);
};