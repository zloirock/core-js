// Neither branch has this static, so an untouched rest pattern needs no candidate warning.
const { banana, ...rest } = choice ? Set : WeakMap;
use(banana, rest);
