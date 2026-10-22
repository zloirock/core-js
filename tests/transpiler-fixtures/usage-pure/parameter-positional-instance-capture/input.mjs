export function full([{ at }]) { return at.call([9], 0); }
export function partial([{ at, length }] = [[4, 5]]) { return [at.call([9], 0), length]; }
export function supplied([{ at, length }]) { return [at.call([9], 0), length]; }
