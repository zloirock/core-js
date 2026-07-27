// the same bail reached from the positions where a stray injection costs more than a dead import,
// because the emitter restructures the surrounding expression around the receiver: a side-effecting
// sequence receiver forces a null-guard memo that hoists the effect out, an argument position nests
// that guard inside a call, and a computed key spells the member with no dot to rewrite. the
// receiver type is known and foreign in all three, so none may inject - only the array push of the
// first line is a real use and stays polyfilled, which also proves the machinery is not suppressed
// wholesale. distinct method per line
const log = [];
(log.push(1), RegExp.prototype)?.at(0);
declare const inArg: Date | RegExp;
f(inArg?.includes(1));
declare const computed: Date | Map<string, number>;
computed?.["forEach"](g);
