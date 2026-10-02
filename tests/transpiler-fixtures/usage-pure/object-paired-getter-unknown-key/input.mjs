// An unresolved computed sibling retains the explicitly named array slot.
// Only array at is needed when the runtime key names an unrelated property.
function read(key) {
  const box = {
    get rows() { return [8, 9]; },
    set rows(value) {},
    [key]: 0
  };
  return box.rows.at(-1);
}
use(read("meta"));
