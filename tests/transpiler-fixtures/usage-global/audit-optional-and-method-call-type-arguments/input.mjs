// explicit type arguments at an optional-call site and a method-call site reference globals that
// the call's own visitor never reads as runtime refs; distinct globals per line keep each mappable
// @ts-expect-error a generic named without its type arguments is the shape under test
foo?.<Map<number>>();
obj.handle<Set<number>>();
