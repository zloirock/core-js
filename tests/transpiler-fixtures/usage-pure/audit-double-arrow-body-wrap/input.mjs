// nested arrow expression bodies, each with an instance-method chain that needs
// single-evaluation memoization. inner arrow body must convert to a block and keep
// its `_ref` var local rather than hoisting it to the outer arrow's params
const g = x => (y => x.at(y).flat())(0);
