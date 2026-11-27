import "core-js/modules/es.array.at";
// Only the matched branch supplies an array.
type Row = {
  outer: {
    tag: {
      kind: 'a';
    };
  };
  items: number[];
} | {
  outer: {
    tag: {
      kind: 'b';
    };
  };
  items: string;
};
export function read(value: Row) {
  if (value.outer.tag.kind === 'a') return value.items.at(0);
}