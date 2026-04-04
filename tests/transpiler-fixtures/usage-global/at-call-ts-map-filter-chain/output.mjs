import "core-js/modules/es.array.at";
import "core-js/modules/es.array.filter";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.string.trim";
(arr as string[]).map(x => x.trim()).filter(Boolean).at(-1);