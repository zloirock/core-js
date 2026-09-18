// A lexical loop binding cannot escape through a same-name read outside the loop.
// Pure keeps Map narrow and gives the escaping outer Set its namespace.
function expose() {
  let value = Set;
  for (const { item: value } of [{ item: Map }]) {}
  hand(value);
}
