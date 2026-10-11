// a for-x head whose iterated literal reads the head itself (`for (const Y of [Y])` - a TDZ error with a
// lexical head, the previous value with a var one) names no value for it: a read off the head takes what
// an unknown receiver takes
for (const Y of [Y]) use(Y.keys());
for (var Z of [Z]) use(Z.at(0));
