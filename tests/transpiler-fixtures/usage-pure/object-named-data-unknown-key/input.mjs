// An unresolved computed sibling retains the explicitly named array slot.
// Only array at is needed when the runtime key names an unrelated property.
function read(key) {
  const box = {
    rows: [8, 9],
    [key]: 0
  };
  return box.rows.at(-1);
}
use(read("meta"));
