// The plain computed key runs once, including when the optional chain yields undefined.
function read({ from } = (self?.globalThis.window)[(note(), 'Array')]) { return from; }
use(read);
