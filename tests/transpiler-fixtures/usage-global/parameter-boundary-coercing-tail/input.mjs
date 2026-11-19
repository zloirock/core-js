// Even a literal can invoke user code through numeric coercion.
export function read({ at }, options = { value: +[] }) { return [at, options]; }
