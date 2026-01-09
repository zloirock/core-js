import stringDedent from '@core-js/pure/full/string/dedent';

const rdedent1: string = stringDedent`foo\nbar`;
const rdedent2: string = stringDedent`line1
  line2
  line3`;

const tpl = Object.assign(['foo', 'bar'], { raw: ['foo', 'bar'] });
stringDedent(tpl, 1, 2);

stringDedent({ raw: ['a\n  b\n', '\n  c\n'] }, 1, 2);

const myTag = (strings: { raw: readonly string[]}, ...values: (string | number)[]) => {
  return { strings, values } as const;
};
const myAndDedent = stringDedent(myTag);
myAndDedent`line1
  line2
  line3`;

// @ts-expect-error
stringDedent();
