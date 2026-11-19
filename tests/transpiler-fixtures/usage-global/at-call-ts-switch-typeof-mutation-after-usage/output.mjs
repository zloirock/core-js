import "core-js/modules/es.string.at";
import "core-js/modules/es.string.strike";
function test(x: string | number[]) {
  switch (typeof x) {
    case 'string':
      x.at(0).strike();
      // @ts-expect-error the write crosses the declared or narrowed type on purpose, and the read sees the runtime value
      x = ['reassigned'];
      break;
  }
}