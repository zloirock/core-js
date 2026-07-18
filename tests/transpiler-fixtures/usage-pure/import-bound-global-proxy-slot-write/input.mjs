// a slot write through a USER-AUTHORED pure global-this import taints the name exactly like
// the bare proxy write - recognition is import-SOURCE-based, so it works before pure-import
// registration (the mutation prepass runs first) and the bare read stays raw
import g from "@core-js/pure/actual/global-this";
g.Map = Shim;
new Map([[1, 2]]);
