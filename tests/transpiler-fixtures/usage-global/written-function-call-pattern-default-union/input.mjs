// A destructured function result keeps the known families of its field.
// An omitted argument uses the default field union.
const box = {};
box.fn = ({ rows } = { rows: flag ? ["a"] : "ab" }) => rows;
use(box.fn().includes("a"));
