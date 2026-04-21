import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// `Parameters<typeof fn>[N]` where fn has rest param `...rest: string[]`.
// ambient `declare function` form - before fix, estree-toolkit's scope crawler
// didn't recognise TSDeclareFunction as a scope owner and hit the RestElement
// reference handler which throws `This should be handled by findVisiblePathsInPattern`.
// fix: pre-parse pass retypes TSDeclareFunction to FunctionDeclaration with empty body
declare function fn(a: number, b: boolean, ...rest: string[]): void;
declare const x: Parameters<typeof fn>[2];
_atMaybeString(x).call(x, 0);
_includesMaybeString(x).call(x, 'foo');