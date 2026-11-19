import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
// A served optional method owns its receiver comment once.
// The receiver guard and later reads share the value, not the comment.
arr /* receiver */?.flat?.().at(0);