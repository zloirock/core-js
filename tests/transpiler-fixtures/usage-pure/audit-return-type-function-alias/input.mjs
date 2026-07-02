// ReturnType<FunctionAlias> - TS accepts a function-type alias (no `typeof`) as the arg.
// resolver must follow the alias chain to the function type and extract its return annotation.
// without this step, `ReturnType<Fn>` falls through to unknown and dispatch is generic `_at`
type Fn = () => string[];
declare const x: ReturnType<Fn>;
x.at(0);
