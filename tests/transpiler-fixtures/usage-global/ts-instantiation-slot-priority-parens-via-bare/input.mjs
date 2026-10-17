// the `expr<T>` instantiation slot takes a LeftHandSideExpression, so every looser shape carries
// source parens. the reprint has no paren rule of its own there: dropped, the call re-associates
// into the arrow body / the ternary alternate / the optional chain, or stops parsing altogether.
// the tail lines are the negatives - the shapes the slot accepts bare must STAY bare
const f: any = (x: number) => x;
const viaBare = ((f)<string>)(1);
