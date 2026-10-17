// A flat inline spread preserves the complete argument window for both instance reads.
const result = (([{ at }, { flat }]) => [at, flat])([[1], ...[[2]]]);
export { result };
