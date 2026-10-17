import "core-js/modules/es.array.at";
import "core-js/modules/es.json.stringify";
function probe(k) {
  const local = {
    data: [5],
    read() {
      return this.data.at(5);
    }
  };
  local[k];
  JSON.stringify(local);
  return local.read();
}
probe('data');