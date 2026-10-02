import "core-js/modules/es.array.at";
// An arrow property reader preserves a readonly named array argument.
const pick = <T extends {
  rows: unknown;
},>(o: T): T["rows"] => o.rows;
const box = {
  rows: [8, 9]
} as const;
use(pick(box).at(-1));