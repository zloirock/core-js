import "core-js/modules/es.array.at";
// @ts-expect-error the annotation, not the initializer, types the value, which is the shape under test
function f({
  items
}: {
  items: string[];
} = {}) {
  items.at(-1);
}