import stringDedent from '@core-js/pure/full/string/dedent';

const rdedent1: string = stringDedent`foo\nbar`;
const rdedent2: string = stringDedent`line1
  line2
  line3`;

const tpl = Object.assign(['foo', 'bar'], { raw: ['foo', 'bar'] }) as TemplateStringsArray;
stringDedent(tpl, 1, 2);

stringDedent({ raw: ["a\n  b\n", "\n  c\n"] }, 1, 2);

// @ts-expect-error
stringDedent();
