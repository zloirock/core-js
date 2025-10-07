import dedent from '@core-js/pure/full/string/dedent';

const rdedent1: string = dedent`foo\nbar`;
const rdedent2: string = dedent`line1
  line2
  line3`;

const tpl = Object.assign(['foo', 'bar'], { raw: ['foo', 'bar'] }) as TemplateStringsArray;
dedent(tpl, 1, 2);

// @ts-expect-error
dedent(['foo', 'bar'], 1, 2);
// @ts-expect-error
dedent('foo', 1, 2);
// @ts-expect-error
dedent();
