// liquidjs: Liquid templates rendered - filters, loops, conditions, capture, case, raw, whitespace
// control, partials from memory - through the sync and the async API. Expected values are the Liquid
// language's (Shopify's reference).
//
// Its reason is the SYNTAX axis: the engine renders through generators, which its own loop drives in
// both APIs - 135 generator functions in its build against 15 in the whole corpus, of which V8
// coverage of a native run counts 30 executed. Its 26 `yield*` are not: delegation goes through that
// loop instead.
//
// The browser build, imported by path: the package has no exports map, and the build its `module`
// field names imports `fs` and `path`. `Intl` is read behind a `typeof` guard.
import { Liquid } from 'liquidjs/dist/liquid.browser.mjs';
import { checker } from './checks.mjs';

const engine = new Liquid({
  templates: { greeting: 'Hi {{ who }}', row: '<li>{{ item.name }}</li>' },
});
engine.registerFilter('twice', value => value + value);

export function run() {
  const { checks, check } = checker();
  function sync(source, scope) {
    // eslint-disable-next-line node/no-sync -- the engine's own synchronous API, not a node one
    return engine.parseAndRenderSync(source, scope);
  }
  check('output_filters', sync('{{ "hello" | upcase }} {{ "a,b,c" | split: "," | join: "-" }} {{ 3.14159 | round: 2 }}'), 'HELLO a-b-c 3.14');
  check('for_range', sync('{% for i in (1..4) %}{{ i }}{% unless forloop.last %},{% endunless %}{% endfor %}'), '1,2,3,4');
  check('if_and_default', sync('{% if n > 1 %}many{% else %}one{% endif %} {{ missing | default: "n/a" }}', { n: 2 }), 'many n/a');
  check('assign_capture', sync('{% assign x = "ab" | twice %}{% capture y %}[{{ x }}]{% endcapture %}{{ y }}'), '[abab]');
  check('case', sync('{% case k %}{% when "a" %}A{% when "b", "c" %}BC{% else %}?{% endcase %}', { k: 'c' }), 'BC');
  check('raw', sync('{% raw %}{{ not rendered }}{% endraw %}'), '{{ not rendered }}');
  check('whitespace_control', sync('a  {%- if true -%}  b  {%- endif -%}  c'), 'abc');
  check('render_partials', sync('{% render "greeting", who: "Ada" %}<ul>{% for item in items %}{% render "row", item: item %}{% endfor %}</ul>',
    { items: [{ name: 'x' }, { name: 'y' }] }), 'Hi Ada<ul><li>x</li><li>y</li></ul>');
  check('nested_loops', sync('{% for row in rows %}{% for v in row %}{{ v | times: 2 }}{% endfor %};{% endfor %}', { rows: [[1, 2], [3]] }), '24;6;');
  // `.then` rather than `async`: the async machinery under test is the engine's
  // eslint-disable-next-line promise/prefer-await-to-then -- see above
  return engine.parseAndRender('{% for i in (1..3) %}{{ i | plus: 10 }}{% endfor %}').then(text => {
    check('async_render', text, '111213');
    return { checks };
  });
}
