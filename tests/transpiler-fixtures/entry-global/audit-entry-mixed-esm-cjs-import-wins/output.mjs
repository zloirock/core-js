import "core-js/modules/es.array.at";
// Mixed source: `import` at top (ESM marker) + CJS `require(core-js)` entry in middle.
// ESM markers take precedence; plugin emits `import` for its generated modules.
import { foo } from "./x.mjs";
foo();