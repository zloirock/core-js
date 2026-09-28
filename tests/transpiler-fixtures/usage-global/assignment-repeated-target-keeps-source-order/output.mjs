import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.string.iterator";
// One pattern writing a binding twice keeps the source's last write. A claim whose extraction would
// land before an earlier write of the same target - or behind a later one, where a nested claim on
// an assignment is overwritten after the statement - keeps its native read. Two claims on one level
// are written in turn, so both still extract.
let last, len, pair;
({
  length: last,
  from: last
} = Array);
({
  w: {
    at: len,
    length: len
  }
} = {
  w: []
});
({
  flat: pair,
  flatMap: pair
} = []);
export { last, len, pair };