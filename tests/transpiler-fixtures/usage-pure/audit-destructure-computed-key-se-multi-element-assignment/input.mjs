// An assignment with two effectful computed keys evaluates each key before reading
// its method. Both bindings share the original receiver and keep source order.
let x, y;
({ [(e1(), 'flat')]: x, [(e2(), 'at')]: y } = arr);
