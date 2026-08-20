// `import * as ns from 'core-js'` does NOT trigger entry-global expansion. plugin
// only matches default / side-effect imports of the bare `'core-js'` specifier; a
// namespace import is treated as user code that happens to mention `core-js`. ns is
// preserved as-is even though core-js has no named exports - bundler resolution may
// later flag the namespace as empty
import * as ns from 'core-js';
ns;
Array.from(arr);