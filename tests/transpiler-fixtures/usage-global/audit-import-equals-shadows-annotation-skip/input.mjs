// `import Map = require('x')` - TS value-mode CJS import (no `type` modifier) is a runtime
// binding. annotation walker must consult the shared adapter hasBinding so this runtime
// shadow suppresses the Map polyfill emission for the downstream `let y: Map<string>`
import Map = require("x");
let y: Map<string>;
export { y };
