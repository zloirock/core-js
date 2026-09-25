// a member read through a call's container keeps the call where it has an effect, resolves a name
// the callee spells in the callee's scope - past a namesake at the call site - and reads natively
// where the slot's argument is unknown. one static per row
const noisy = value => { log.push(value); return { a: Math, b: value }; };
export const effectful = noisy(1).a.log10(100);
const named = value => ({ a: Object, b: value });
{
  const Object = custom;
  use(named(1).a.fromEntries([]));
}
export const unknownArgument = noisy(src).b.hypot(3, 4);
