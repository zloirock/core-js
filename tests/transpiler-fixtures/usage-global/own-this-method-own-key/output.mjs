import "core-js/modules/es.array.at";
// This definition uses another receiver, so the rows remain an array.
const holder = {
  rows: [],
  [sink(this)]() {}
};
holder.rows.at(0);