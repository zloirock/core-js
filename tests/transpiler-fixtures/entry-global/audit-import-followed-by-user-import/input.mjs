// Entry import is at the top, followed by an unrelated user import. detectEntries iterates
// `ast.body` and only the matching node is removed; the user `import` remains untouched.
import 'core-js/actual/array/from';
import { unrelated } from './user-mod';
unrelated();
