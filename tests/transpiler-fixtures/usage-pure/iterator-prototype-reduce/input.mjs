// isolated `Iterator.prototype.reduce` - terminal aggregator over Iterator.from seed
Iterator.from([1, 2, 3]).reduce((a, b) => a + b, 0);
