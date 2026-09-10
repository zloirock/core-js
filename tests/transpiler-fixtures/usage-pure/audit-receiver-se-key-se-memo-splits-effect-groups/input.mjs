// a harvested effect list carries the receiver's own effects first and the computed-key ones
// after, and the receiver memo belongs BETWEEN them: ECMA evaluates the receiver before the
// key, so a memo leading the whole list would read the receiver ahead of the prefix that
// evaluates it. the negatives pin the boundary - a key-only list has nothing to lead, and a
// literal receiver fuses its memo into the lookup, where constructing it observes nothing
const split = (recv(), box.list)[(k(), 'at')](0);
const keyOnly = box.list[(k(), 'flat')]();
const fused = (recv(), [1, 2])[(k(), 'includes')](1);
split;
keyOnly;
fused;
