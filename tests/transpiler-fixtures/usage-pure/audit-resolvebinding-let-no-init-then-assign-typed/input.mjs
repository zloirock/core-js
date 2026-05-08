// `let buf: number[]` declared without init, then assigned. the type annotation must
// drive narrowing for downstream instance methods, even though the binding has been
// reassigned (which would normally bail static-shape resolution)
let buf: number[];
buf = [10, 20, 30];
buf.findLast(n => n > 5);
buf.at(0);
buf.includes(20);
