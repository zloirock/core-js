// catch-binding `{ from }` whose body declares a NAMED FUNCTION EXPRESSION `function from()`:
// the NFE id slot is a BINDING POSITION, not a reference to the catch-bound `from`. both plugins
// skip it as a non-reference binding position, so the catch param has no real references and no
// extraction fires - catch left as-is, no `_ref`, even though `from` is lexically Array.from's name
try {
  someCall();
} catch ({
  from
}) {
  const fn = function from() {
    return [1];
  };
  fn();
}