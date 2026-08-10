import _at from "@core-js/pure/actual/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// The negatives of the valueless-redeclaration strip, both init-less declarators by shape.
// A plain reassignment is a real write and still decides the receiver (string, not array), and a
// for-x head rebinds every iteration over values this cannot see - stripping either by shape alone
// would type the receiver off a dead init.
var reassigned = [1, 2, 3];
reassigned = 'abc';
_atMaybeString(reassigned).call(reassigned, 0);
var looped = [1, 2, 3];
for (var looped of [['a'], 'b']) {}
_at(looped).call(looped, 0);