"use strict";

require("core-js/modules/es.array.at");
// when `@babel/plugin-transform-modules-commonjs` strips ESM markers after the polyfill
// pass, the late-CJS warning must still be surfaced.
[1, 2, 3].at(0);