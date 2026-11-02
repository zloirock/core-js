// Nested spread expansion keeps holes, effects and the following constructor in order.
export const log = [];
export const [first, second, { groupBy }, ...rest] = [...[...[,(log.push(1), 2)]], Map, Set];
