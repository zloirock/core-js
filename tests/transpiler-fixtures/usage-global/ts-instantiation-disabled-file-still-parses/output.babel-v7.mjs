// core-js-disable-file
// a disabled file injects nothing, but it is still REPRINTED - this plugin being in the list is
// what forces that. so the paren restorations run here too: they are damage control for the
// reprint, not injection, and skipping them hands back source that no longer parses at all
declare const mk: any;
declare const f: any;
declare const o: any;
export const viaMemberTail = (mk<number>).nothing;
export const viaFusingCast = (f as any)<string>;
export const viaOptionalCall = o.m<never>?.(1);
export const viaTaggedTag = o.tag<never>`t`;