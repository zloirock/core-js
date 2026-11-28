function w<T>(x: T): { v: T } { return { v: x }; }
w(Object.assign([7], { a: 1 })).v.at(0);
