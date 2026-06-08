// usage-pure STACKED labeled loop (`lab1: lab2: for(...)`) whose header needs a `_ref` memo and
// whose body is `continue <outerLabel>`: both labels must stay on the loop. a single-level
// isLoopStatement check sees only the inner LabeledStatement (not the loop) when walking up, so it
// wraps the inner label in a memo block and the OUTER label lands on the block - making
// `continue lab1` an illegal continue (V8 rejects it; the oxc runner does not). peel the stacked
// labels and hoist the memo above both. regression lock
lab1: lab2: for (let i = 0; [1].at(i) >= 0; i++) continue lab1;
