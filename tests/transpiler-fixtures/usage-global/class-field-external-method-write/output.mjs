import "core-js/modules/es.array.at";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.string.at";
class Rows {
  data = [4];
  read() {
    return this.data.map(x => x).at(0);
  }
}
const rows = new Rows();
const first = rows.read();
const values = rows.data;
values.map = () => "abc";
export const result = [first, rows.read()];