// TSImportEqualsDeclaration with isExport=false. type-only import equals is tsc-elided;
// runtime references to `Set` resolve to the global. Without filtering this binding shape
// in `hasBinding`, the polyfill would suppress for tsc-elided imports. Both adapters use
// `ambient binding filter` (shared helper) for symmetric filtering
import type Set = require('node:set');

function build() {
  const s = new Set([1, 2]);
  return Array.from(s).at(0);
}
build();
