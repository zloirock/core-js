import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import data from './data.json' with { type: 'json' };
Object.fromEntries(Object.entries(data));