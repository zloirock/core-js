import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.regexp.exec";
import "core-js/modules/es.regexp.species";
import "core-js/modules/es.string.match-all";
'test'.matchAll(/t/g).toArray().at(0).includes('t');