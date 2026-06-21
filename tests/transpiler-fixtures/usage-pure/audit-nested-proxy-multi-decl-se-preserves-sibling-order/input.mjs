// Nested-proxy destructure (`{Array: {from}} = globalThis`) with an SE prefix on its init
// AND a pre-sibling declarator carrying its own inline SE; all run observable log() so
// reordering is visible. the destructure's SE must land between the pre-siblings and the
// extracted target, preserving source order: log('A') -> log('B') -> from extraction
const a = (log('A'), 'x'), { Array: { from } } = (log('B'), globalThis);
export { a, from };
