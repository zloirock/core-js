// NEGATIVE: a for-of HEAD binding re-runs per iteration off dynamic iterable values - the
// head's own destructure never judges as a stable Symbol alias
for (const { asyncIterator: viaForOfHead = 0 } of [Symbol]) {
  export_.push([][viaForOfHead]);
}
