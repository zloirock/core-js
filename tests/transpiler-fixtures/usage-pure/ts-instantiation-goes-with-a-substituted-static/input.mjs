// an instantiation over a substituted static goes with it, as a cast does: anywhere but the slot of a
// call, a `new` or a tag it only types the value it wraps. those three hosts take the type arguments
// over and keep them on the substituted binding
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tail = (Map.groupBy<any>);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaCast = ((Object.groupBy as any)<any>);
const memberTail = (Array.from<any>).name;
const argument = use((Array.of<any>));
const element = [(Promise.allSettled<any>)];
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const outerCast = (((Promise.any as any)<any>) as unknown);
const nonNull = (((Iterator.from)!)<any>);
// NEGATIVE: the hosts that carry type arguments of their own
const call = (Promise.withResolvers<any>)();
const ctor = new (Set<number>)();
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const tag = (String.raw<any>)`t`;
export const r = [tail, viaCast, memberTail, argument, element, outerCast, nonNull, call, ctor, tag];
