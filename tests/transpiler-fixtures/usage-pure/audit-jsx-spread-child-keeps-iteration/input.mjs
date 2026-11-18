// A JSX spread child iterates its operand exactly as a spread attribute does, so an argument
// carrying one is not effect-free and the receiver in front of it has to survive. The plain
// expression container evaluates just its child. A known local can fold, a missing name can throw.
export const spreadChild = (() => Array)(<div>{...poison}</div>).from(a);
export const spreadAttribute = (() => Array)(<div {...poison} />).from(b);
export const expressionContainer = (() => Array)(<div>{pure}</div>).from(c);
const initialized = 1;
export const localContainer = (() => Array)(<div>{initialized}</div>).from(c);
export const emptyElement = (() => Array)(<div />).from(d);
