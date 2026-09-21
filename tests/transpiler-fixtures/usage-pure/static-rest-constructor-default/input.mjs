// The constructor default uses its index; supplied objects keep their own properties.
export function read({ all, ...rest } = Promise) {
  return [all, rest];
}
read();
read({ all: custom, extra: 7 });
