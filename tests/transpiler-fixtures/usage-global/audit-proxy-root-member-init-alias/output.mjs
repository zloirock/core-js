import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// a proxy root can be captured through a MEMBER read (`const s = globalThis.self`), not only through a
// bare name. the detection side follows that init; the class-walk root recogniser deliberately follows
// an Identifier init only, and that is why the two cannot share one walk. the rows pin the capability:
// an alias bound to a member read still names the proxy surface, so a mutation through it registers and
// a plain read through it resolves. the second row is the Identifier-init twin both walks agree on
const viaMember = globalThis.self;
const viaName = globalThis;

// the alias holds a member-captured proxy root: the read through it must resolve to the global surface
export function memberCapturedRootResolves() {
  return viaMember.Array.from([1, 2]).at(0);
}

// the Identifier-init twin: the same capability through a bare-name capture
export function nameCapturedRootResolves() {
  return viaName.Array.from([3, 4]).includes(3);
}