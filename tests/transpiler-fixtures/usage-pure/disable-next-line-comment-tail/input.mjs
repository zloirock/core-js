// A comment opening on the disabled line must not extend its coverage.
consume(
  // core-js-disable-next-line
  1, 2); /* continued
  comment */ [1, 2].at(-1);
