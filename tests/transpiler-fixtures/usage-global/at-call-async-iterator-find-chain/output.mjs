import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.values";
import "core-js/modules/es.string.at";
const result = await Object.keys(x).values().toAsync().find(fn);
result.at(0);