// An inline array spread supplies the parameter captures with their actual element values.
// The at and flat leaves each read that captured receiver once.
const result = (([{ at }, { flat }]) => [at, flat])([[1], ...[[2]]]);
export { result };
