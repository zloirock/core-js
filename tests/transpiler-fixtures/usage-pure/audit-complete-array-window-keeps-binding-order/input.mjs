// A quiet trailing argument element lets earlier bound instance reads stay eager.
const result = (([{ at }, { flat }]) => [at, flat])([[1], [2], 0]);
export { result };
