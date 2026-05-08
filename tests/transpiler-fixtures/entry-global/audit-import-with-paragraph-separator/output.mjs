import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// real U+2029 (paragraph separator) terminates the entry import; ES treats it as a
// line terminator, so the import must be removed cleanly without leaving the separator
// dangling before the next statement

const result = [].includes(1);