// an IIFE call-arg shadowed by a same-named inner param still synths: the argument
// evaluates at the CALL SITE, so its statics resolve in the outer scope - the synth
// literal replaces the arg exactly like the unshadowed form
!function ({ from }, Array) { use(from); } (Array);
!function ({ of } = Map, Array) { use(of); } (Array);
// an SE-wrapped arg: the synth literal replaces only the sequence TAIL, the effect stays
!function ({ entries }, Object) { use(entries); } ((eff(), Object));
