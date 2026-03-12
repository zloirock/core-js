import "core-js/modules/es.string.at";
function process(x: string | number[]) {
  switch (typeof x) {
    case 'string':
      return x.at(-1);
  }
}