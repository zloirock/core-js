// The negatives of the valueless-redeclaration strip, both init-less declarators by shape.
// A plain reassignment is a real write and still decides the receiver (string, not array), and a
// for-x head rebinds every iteration over values this cannot see - stripping either by shape alone
// would type the receiver off a dead init.
var reassigned = [1, 2, 3];
reassigned = 'abc';
reassigned.at(0);

var looped = [1, 2, 3];
for (var looped of [['a'], 'b']) { }
looped.at(0);
