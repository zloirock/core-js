import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
let acc;
for (let a = Array.from([9, 8]); acc === undefined;) acc = a.at(0);