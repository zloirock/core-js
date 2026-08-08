import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Entry import is at the top, followed by an unrelated user import. detectEntries iterates
// `ast.body` and only the matching node is removed; the user `import` remains untouched.

import { unrelated } from './user-mod';
unrelated();