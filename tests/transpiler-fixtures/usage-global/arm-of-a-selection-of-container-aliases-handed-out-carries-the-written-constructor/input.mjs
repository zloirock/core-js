// a constructor written through a binding that holds a selection of container names lands in whichever arm
// the selection yields, so an arm handed out hands the written constructor out with it, statics included
const listed = { C: 0 };
const other = { C: 1 };
const either = flag ? listed : other;
either.C = Map;
install(listed);
const first = { C: 2 };
const second = { C: 3 };
const pick = first || second;
pick.C = Promise;
register(first);
