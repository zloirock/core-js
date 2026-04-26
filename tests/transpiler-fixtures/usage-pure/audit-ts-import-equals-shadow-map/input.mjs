// `import Map = require("./mod")` (TSImportEqualsDeclaration) - TypeScript-specific
// syntax that creates a runtime binding to a CJS module. when the imported name shadows
// a polyfill candidate, the binding must be respected: no polyfill emission, no rename
// of the user identifier
import Map = require("./my-map");
const m = new Map();
