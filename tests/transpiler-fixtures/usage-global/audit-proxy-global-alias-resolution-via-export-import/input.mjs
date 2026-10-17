// the `export` modifier does not change the local binding's value
export import gE = require("@core-js/pure/actual/global-this");
export const viaExportImport = gE.Promise.allSettled([1]);
