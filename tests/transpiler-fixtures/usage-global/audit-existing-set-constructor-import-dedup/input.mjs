// user pre-imports `es.set.constructor` (a partial / minimal subset). plugin still
// needs intersection + dependent helpers, but must not re-emit `es.set.constructor`.
// dedup keys on resolved module path; user's import sits in the polyfill batch
// where the plugin would otherwise have placed it
import 'core-js/modules/es.set.constructor';
const s = new Set();
s.has(1);
s.intersection(other);
