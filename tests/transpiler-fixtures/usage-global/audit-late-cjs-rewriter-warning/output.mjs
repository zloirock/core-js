"use strict";

require("core-js/modules/es.array.at");
// late-CJS detection diagnostic in usage-global mode. mirror of usage-pure variant -
// sibling `@babel/plugin-transform-modules-commonjs` strips ESM markers AFTER our
// programExit. without LIF-A-01 fix, our programExit nulled `injector` immediately so
// postHook bailed and the diagnostic warning never surfaced. fix defers cleanup to
// postHook so markersGone + hasFlushed branch fires under both usage modes
[1, 2, 3].at(0);