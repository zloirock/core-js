import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
// a for-x head whose iterated literal reads the head itself (`for (const Y of [Y])` - a TDZ error with a
// lexical head, the previous value with a var one) names no value for it: a read off the head takes what
// an unknown receiver takes
for (const Y of [Y]) use(_keys(Y).call(Y));
for (var Z of [Z]) use(_at(Z).call(Z, 0));