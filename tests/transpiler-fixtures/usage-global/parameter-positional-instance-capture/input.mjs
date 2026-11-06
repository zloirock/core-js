// Positional instance parameters use their supplied slot, with defaults and residual length preserved.
export function full([{ at }]) { return at.call([9], 0); }
export function partial([{ includes, length }] = [[4, 5]]) { return [includes.call([9], 9), length]; }
export function supplied([{ map, length }]) { return [map.call([9], value => value), length]; }
