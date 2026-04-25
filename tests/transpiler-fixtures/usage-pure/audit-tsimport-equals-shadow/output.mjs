// `import X = require(...)` declares a runtime binding `X`. References to `X` resolve
// to the user import, not the global - plugin must respect the shadow and skip polyfill.
// no rename of the import LHS, no synthetic constructor import
import Map = require("./my-map");
const m = new Map();
export { m };