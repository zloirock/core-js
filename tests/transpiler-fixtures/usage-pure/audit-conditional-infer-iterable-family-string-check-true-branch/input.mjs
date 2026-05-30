// Iterable is the one infer-container family that admits a `string` check side: `string` IS
// an Iterable<string>. So `C<string>` keeps the TRUE branch (`U[]`, with U bound via the
// `extends string` constraint), and `r.at(0)` is the array .at (_atMaybeArray). The family
// check must reject primitives only for collection containers (Set / Promise / Array), never
// for the iterable family - this is the positive counterpart that proves it does not overreach.
type C<T> = T extends Iterable<infer U extends string> ? U[] : number;
declare const r: C<string>;
r.at(0);
