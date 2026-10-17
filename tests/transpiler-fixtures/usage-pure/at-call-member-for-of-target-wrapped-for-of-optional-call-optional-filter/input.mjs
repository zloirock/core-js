// optional body read - optionality resolves the SAME written slot (parsers spell it
// differently: OptionalMemberExpression vs ChainExpression-wrapped member)
const g = [11, 12];
for (g.filter of fns) {
  g?.filter(Boolean);
}
