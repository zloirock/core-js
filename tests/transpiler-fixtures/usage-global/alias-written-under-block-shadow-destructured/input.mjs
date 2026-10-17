let source;
{
  const Set = Object;
  source = Set;
}
export const destructured = () => {
  const { fromEntries } = source;
  return fromEntries([['a', 1]]);
};
