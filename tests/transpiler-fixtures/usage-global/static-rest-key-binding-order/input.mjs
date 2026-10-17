// Each key observes the binding at that point in the pattern; rest excludes both slots.
var { [(log(typeof from), 'from')]: from, [(log(typeof from), 'isArray')]: check, ...rest } = Array;
use(from([1]), check([]), rest);
