// A named array parameter consumes the supplied element or its own Array default.
// Every known call needs an extraction; custom methods retain their identity.
function read([{ from } = Array]) { return from; }
function ownFrom(value) { return value; }
read([Array])([1]);
read([Array])([2]);
read([])([3]);
read([undefined])([4]);
read([{ from: ownFrom }])(5);
