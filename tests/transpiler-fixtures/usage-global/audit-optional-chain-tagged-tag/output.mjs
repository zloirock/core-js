import "core-js/modules/es.object.assign";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// a tagged template may not sit on an optional chain: the source parens are what ended that
// chain, and the generator drops them on reprint (it does so with no plugin at all), leaving
// output that does not parse. every mode reprints, so every mode restores them
const host = {
  tag(parts) {
    return parts[0] + parts.length;
  }
};
export const viaMemberTag = (globalThis.window?.self.probeTag.tag)`x${Array.of(1).length}`;
export const viaShortTag = (host?.tag)`y`;
const maybe = () => host;
export const viaCallTag = (maybe()?.tag)`z${Object.assign({}, {
  a: 1
}).a}`;