import "core-js/modules/es.array.at";
// An undefined argument activates the written function's destructured default.
const box = {};
box.fn = ({
  rows
} = {
  rows: [8, 9]
}) => rows;
use(box.fn(undefined).at(-1));