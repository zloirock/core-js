// triple `import 'core-js/full/promise'` in same file - all three should expand to the
// same set of polyfill modules with no duplicate emission. dedup invariant for entry-global.
import 'core-js/full/promise';
import 'core-js/full/promise';
import 'core-js/full/promise';
