// intersection with null/never in fold — foldIntersectionTypes classifier would skip
// $Object('Object') or unresolvable. But `null & X` = never in TS semantics; plugin treats
// each member independently. Risk: `string[] & null` gets folded to string[] (ignoring null).
type WeirdInter = string[] & null;
declare const x: WeirdInter;
x.at(0);
