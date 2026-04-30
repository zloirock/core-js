// file containing ONLY user imports - no polyfillable expressions. reorderRefsAfterImports
// must not crash on body whose entries are all import statements (no var _ref present).
import { foo } from 'mod';
import bar from 'other';