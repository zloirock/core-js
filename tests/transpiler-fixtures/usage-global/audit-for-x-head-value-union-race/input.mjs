// multi-element positional heads pair each name to its own slot
let A3 = Object, B3 = Object;
for ([A3, B3] of [[Promise, Iterator]]) { break; }
A3.race([]);
