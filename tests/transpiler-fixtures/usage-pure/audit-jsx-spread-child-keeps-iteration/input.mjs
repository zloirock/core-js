// A JSX spread child iterates its operand exactly as a spread attribute does, so an argument
// carrying one must survive. Creating even an empty element calls the configured JSX factory.
// A missing child binding throws before the factory runs.
export const spreadChild = (() => Array)(<div>{...poison}</div>).from(a);
export const spreadAttribute = (() => Array)(<div {...poison} />).from(b);
export const expressionContainer = (() => Array)(<div>{pure}</div>).from(c);
const initialized = 1;
export const localContainer = (() => Array)(<div>{initialized}</div>).from(c);
export const emptyElement = (() => Array)(<div />).from(d);
