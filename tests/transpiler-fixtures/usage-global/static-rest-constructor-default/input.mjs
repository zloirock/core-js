// A constructor parameter default with rest requires the full family.
export function read({ all, ...rest } = Promise) {
  return [all, rest];
}
read();
read({ all: custom, extra: 7 });
