// Optional method and result guards retain their receiver inside each default evaluation.
export function read(get, argument, value = get()?.at?.(argument())?.includes('2')) {
  return value;
}
