type T = string[];
function identity<T>(x: T): T { return x; }
identity(42).toFixed(2);
