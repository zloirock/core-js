// User imports an entry-style sub-path AND the top-level `core-js` entry.
// `getCoreJSEntry` matches both: `actual/array/at` resolves as a single-feature entry,
// and `core-js` resolves as the umbrella entry. Both expand into module imports;
// observe whether dedup happens or both expansions emit overlapping modules.
import 'core-js/actual/array/at';
import 'core-js';
