// usage-pure labeled bodyless loop whose header needs a `_ref` memo and whose body is a
// `continue <label>`: the label must stay on the loop. wrapping the loop in a memo block
// (`lab: { var _ref; <loop> }`) makes the label name the block, so the continue becomes an
// illegal continue (V8 rejects it; the oxc runner does not). hoist the memo instead. regression lock
lab: for (let i = 0; [1].at(i) >= 0; i++) continue lab;
