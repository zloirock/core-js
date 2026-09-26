// explicit type arguments at an optional-call site and a method-call site reference globals that
// the call's own visitor never reads as runtime refs; distinct globals per line keep each mappable
foo?.<Map<number>>();
obj.handle<Set<number>>();
