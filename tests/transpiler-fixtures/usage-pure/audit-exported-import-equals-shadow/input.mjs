// `export import Map = require(...)` creates a runtime binding `Map` that shadows the global.
// babel@8 wraps the exported import-equals in an ExportNamedDeclaration (v7 carried an export
// flag on the node instead); both shapes must unwrap to register the shadow and leave `new Map()` un-polyfilled
export import Map = require('mod');
const a = new Map();
export { a };