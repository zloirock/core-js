// A plain rest binding cannot observe the preceding property read.
export function read({ at }, ...values) { return [at, values]; }
