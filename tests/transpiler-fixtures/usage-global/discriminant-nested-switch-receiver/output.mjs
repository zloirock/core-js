import "core-js/modules/es.array.at";
// Only the matched branch supplies an array.
type Row = {
  tag: {
    kind: 'a';
  };
  items: number[];
} | {
  tag: {
    kind: 'b';
  };
  items: string;
};
export function read(value: Row) {
  switch (value.tag.kind) {
    case 'a':
      return value.items.at(0);
  }
}