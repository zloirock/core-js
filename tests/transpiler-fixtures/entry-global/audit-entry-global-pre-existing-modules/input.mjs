// Source already has individual `core-js/modules/*` imports plus a top-level entry import.
// The plugin only matches entry-style sources via `getCoreJSEntry`; pre-existing module
// imports (`core-js/modules/es.array.at`) are not entries and stay intact. The entry
// expansion may emit overlapping module imports.
import 'core-js/modules/es.array.at';
import 'core-js';
