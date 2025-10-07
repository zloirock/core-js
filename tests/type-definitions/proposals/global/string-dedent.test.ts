import 'core-js/full';

const rdedent1: string = String.dedent`foo\nbar`;
const rdedent2: string = String.dedent`line1
  line2
  line3`;

const tpl = Object.assign(['foo', 'bar'], { raw: ['foo', 'bar'] }) as TemplateStringsArray;
String.dedent(tpl, 1, 2);

// @ts-expect-error
String.dedent(['foo', 'bar'], 1, 2);
// @ts-expect-error
String.dedent('foo', 1, 2);
// @ts-expect-error
String.dedent();
