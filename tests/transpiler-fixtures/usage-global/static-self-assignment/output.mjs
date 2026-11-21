import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// The read on the right requires the static even when no later expression calls it.
Array.from = Array.from;