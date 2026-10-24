let source;
{
  const Array = Object;
  source = Array;
}
export const destructured = () => {
  const {
    from
  } = source;
  return from;
};