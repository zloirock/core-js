// ?.prop (non-call, non-computed) keeps the `.` in deoptionalizeNeedle - the replacement
// from an outer transform writes `obj.foo.bar` but the raw needle is `obj?.foo.bar`
obj?.foo.bar.at(0);
