import _at from "@core-js/pure/actual/instance/at";
// intersection with null/never in fold - the intersection-folding step would skip
// $Object('Object') or unresolvable. But `null & X` = never in TS semantics; plugin treats
// each member independently. Risk: `string[] & null` gets folded to string[] (ignoring null).
type WeirdInter = string[] & null;
declare const x: WeirdInter;
// @ts-expect-error a read off a null or undefined type is the probe
_at(x).call(x, 0);