import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A computed key can hand the enclosing receiver to external code.
const holder = {
  rows: [],
  touch() {
    return {
      [sink(this)]() {}
    };
  }
};
holder.touch();
holder.rows.at(0);