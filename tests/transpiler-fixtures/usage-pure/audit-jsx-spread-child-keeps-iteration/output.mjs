import _Array$from from "@core-js/pure/actual/array/from";
// A JSX spread child iterates its operand exactly as a spread attribute does, so an argument
// carrying one must survive. Creating even an empty element calls the configured JSX factory.
// A missing child binding throws before the factory runs.
export const spreadChild = ((() => Array)(<div>{...poison}</div>), _Array$from)(a);
export const spreadAttribute = ((() => Array)(<div {...poison} />), _Array$from)(b);
export const expressionContainer = ((() => Array)(<div>{pure}</div>), _Array$from)(c);
const initialized = 1;
export const localContainer = ((() => Array)(<div>{initialized}</div>), _Array$from)(c);
export const emptyElement = ((() => Array)(<div />), _Array$from)(d);