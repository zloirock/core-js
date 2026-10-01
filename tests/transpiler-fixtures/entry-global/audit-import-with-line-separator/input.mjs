// real U+2028 (line separator) terminates the entry import; ES treats it as a
// line terminator, so the import must be removed cleanly without leaving the separator
// dangling before the next statement. mirror of the U+2029 PSEP coverage
import "core-js/actual/array/from" const result = [].includes(1);
