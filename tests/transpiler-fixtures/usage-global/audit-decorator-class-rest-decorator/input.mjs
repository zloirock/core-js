// decorator factory with a rest-param signature: `function dec(...args)`. the stage-3
// decorator metadata scaffold attaches regardless of the decorator-factory function
// shape (variadic config). an unrelated polyfill in the class body (Map) confirms
// decorator detection passes through the rest-param signature
function withTags(first: string, ...rest: string[]) {
  return function (value: unknown, ctx: ClassDecoratorContext) {
    return value;
  };
}
@withTags('a', 'b', 'c')
class Tagged {
  m = new Map();
}
new Tagged();
