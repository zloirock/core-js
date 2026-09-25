// a destructure whose init is a CALL pairs through the literal the callee returns, the way an inline
// literal pairs: a factory, the array twin, a block body with a statement ahead of its return, an
// IIFE, a method of a literal, a nested slot, a sequence return whose effect stays in the callee and
// an array wrapper over the call. one static per row
const factory = () => ({ a: Math });
const { a: viaFactory } = factory();
export const fromFactory = viaFactory.trunc(1.5);
const list = () => [Object];
const [viaList] = list();
export const fromList = viaList.entries({});
function block() { log.push('block'); return { a: Array }; }
const { a: viaBlock } = block();
export const fromBlock = viaBlock.of(1);
const { a: viaIife } = (() => ({ a: String }))();
export const fromIife = viaIife.raw`x`;
const maker = { build() { return { a: Math }; } };
const { a: viaMethod } = maker.build();
export const fromMethod = viaMethod.sign(-1);
const deep = () => ({ n: { a: Object } });
const { n: { a: viaNested } } = deep();
export const fromNested = viaNested.values({});
const seq = () => (log.push('seq'), { a: Math });
const { a: viaSeq } = seq();
export const fromSeq = viaSeq.cbrt(8);
const wrapped = () => [{ a: String }];
const [{ a: viaWrapped }] = wrapped();
export const fromWrapped = viaWrapped.fromCodePoint(65);
