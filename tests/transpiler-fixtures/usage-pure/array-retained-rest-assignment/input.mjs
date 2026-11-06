// An array assignment capture preserves the stored realm and the rest exclusion around Object.keys.
// The bare Array element keeps its native of/rest pattern and neighbouring binding.
let keys, realmRest, saved;
([{ Object: { keys }, ...realmRest }] = [saved = (effect(), globalThis)]);
let of, ctorRest, tail;
([{ of, ...ctorRest }, tail] = [Array, 7]);
use(keys, realmRest, saved, of, ctorRest, tail);
