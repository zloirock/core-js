// Source already has individual `core-js/modules/*` imports plus a top-level entry
// import (`core-js`). The plugin expands the entry import into its full module set,
// which OVERLAPS with the pre-existing module import - the pre-existing one is
// effectively replaced by the expansion (output identical to a clean entry-only
// input, see `audit-entry-global-pre-existing-actual-entry/output.mjs`).
import 'core-js/modules/es.array.at';
import 'core-js';
