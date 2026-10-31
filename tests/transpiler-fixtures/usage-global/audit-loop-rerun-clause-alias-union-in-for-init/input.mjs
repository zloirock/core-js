// once-per-entry slots keep resolving to a single static
export function inForInit(n) {
  let kInit = "fromEntries";
  for (let acc = Object[kInit]([["a", 1]]); n--; kInit = "keys") { acc = acc; }
}
