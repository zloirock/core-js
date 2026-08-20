// multi-element SE-key assignment: each element appends its own post-statement overwrite (`x = _m(arr)`),
// both re-referencing the receiver - neither binding is dropped
let x, y;
({ [(e1(), 'flat')]: x, [(e2(), 'at')]: y } = arr);
