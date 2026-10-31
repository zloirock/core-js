// a logical assignment stores over an unset binding only when its operator can: `??=` and `||=`
// write the literal, so a deferred destructure of the binding reads the slot's constructor; `&&=`
// never writes over undefined, so the binding still holds nothing and its read stays raw
let viaNullish;
viaNullish ??= { u: Map };
let viaOr;
viaOr ||= { u: Promise };
let viaAnd;
viaAnd &&= { u: Iterator };
export const nullish = () => { const { u: { groupBy } } = viaNullish; return groupBy; };
export const or = () => { const { u: { try: attempt } } = viaOr; return attempt; };
export const and = () => { const { u: { from } } = viaAnd; return from; };
