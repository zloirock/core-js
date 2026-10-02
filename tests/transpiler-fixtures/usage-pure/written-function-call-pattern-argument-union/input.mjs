// A destructured function result keeps the known families of its field.
// An argument replaces the default with an array or string field.
const box = {};
box.fn = ({ rows } = { rows: ["a"] }) => rows;
use(box.fn({ rows: flag ? ["a"] : "ab" }).includes("a"));
