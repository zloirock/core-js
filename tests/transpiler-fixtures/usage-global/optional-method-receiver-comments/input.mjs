// A raw optional method owns its receiver comment once.
// Dispatching the following instance call does not repeat it.
obj /* receiver */.method?.().at(0);
