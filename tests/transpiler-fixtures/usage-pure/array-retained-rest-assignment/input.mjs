// A captured array assignment keeps its stores and static rest exclusions.
// A neighbouring binding follows the nested static; a constructor rest uses its pure source.
let keys, realmRest, saved;
([{ Object: { keys }, ...realmRest }] = [saved = (effect(), globalThis)]);
let of, ctorRest, tail;
([{ of, ...ctorRest }, tail] = [Array, 7]);
use(keys, realmRest, saved, of, ctorRest, tail);
