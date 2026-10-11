// a pattern reading a constructor's static through a selection of container literals reads it back off
// the binding pure puts in the slot - nothing extracts it - so that constructor's import carries its
// statics, whichever selection spells the choice
export const { C: { groupBy } } = flag ? { C: Map } : user;
let attempt;
export const assign = () => ({ C: { try: attempt } } = flag ? { C: Promise } : user);
export const [{ from: iterate }] = flag ? [Iterator] : [user.C];
export const { C: { canParse } } = (flag && { C: URL }) || user;
export const { C: { for: named } } = maybe ?? { C: Symbol };
