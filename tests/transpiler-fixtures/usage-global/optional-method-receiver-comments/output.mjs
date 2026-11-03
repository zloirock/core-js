import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A raw optional method owns its receiver comment once.
// Dispatching the following instance call does not repeat it.
obj /* receiver */.method?.().at(0);