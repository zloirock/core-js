import _includes from "@core-js/pure/actual/instance/includes";
// the preceding-assignment narrow descends into the fall-through branch of an `if` whose other
// branch hard-exits; an assignment found there must bind the SAME binding as the use, not a
// same-named declaration the branch shadows. the outer `data` is what `fetchRaw` returned, so its
// union stays whole and both families inject
declare function fetchRaw(): string | string[];
declare function normalize(s: string): string;
export function probe(ok: boolean) {
  let data: string | string[] = [];
  data = fetchRaw();
  if (ok) {
    let data = 'fallback';
    data = normalize(data);
  } else {
    throw new Error('failed');
  }
  return _includes(data).call(data, 'x');
}