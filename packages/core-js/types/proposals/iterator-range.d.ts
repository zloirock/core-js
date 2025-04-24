// proposal stage: 2
// https://github.com/tc39/proposal-Number.range
type RangeOptionsNumber = {
  step?: number;
  inclusive?: boolean;
};

type RangeOptionsBigInt = {
  step?: bigint;
  inclusive?: boolean;
};

interface IteratorConstructor {
  range(start: number, end: number, options?: number | RangeOptionsNumber): Iterator<number>;

  range(start: bigint, end: bigint, options?: bigint | RangeOptionsBigInt): Iterator<bigint>;
}

declare var Iterator: IteratorConstructor;
