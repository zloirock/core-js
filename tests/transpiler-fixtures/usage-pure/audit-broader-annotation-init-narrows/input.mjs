// broad annotation (`object`) lets the concrete init narrow the type - opposite case to
// `T | null = null`: here init is informative and annotation deliberately permissive
const arr: object = [1, 2, 3];
const a = arr.flat();
const b = arr.at(0);