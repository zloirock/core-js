// An ambient `declare class` that extends a built-in: the instance type must walk the inheritance
// chain to the polyfill-relevant base (`Array`), not stop at the foreign nominal. Babel keeps the
// nominal name without the ambient anchor (estree-toolkit binds the class and walks the extends),
// so the precise array helper is emitted only once both parsers resolve the inherited base.
declare class MyArr extends Array<string> {}
new MyArr().includes('x');
