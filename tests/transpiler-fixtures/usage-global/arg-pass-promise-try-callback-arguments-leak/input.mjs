// `Promise.try(fn, ...args)` calls `fn` with the arguments after it, so a holder passed there reaches
// code that may rewrite its field and keeps no narrow; in the callback slot itself it is only called
export function viaArgument(fn) {
  const holder = { items: [1, 2] };
  Promise.try(fn, holder);
  return holder.items.at(0);
}
export function viaCallback() {
  const holder = { items: [1, 2] };
  Promise.try(holder);
  return holder.items.includes(1);
}
