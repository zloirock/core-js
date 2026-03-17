import "core-js/modules/es.string.at";
declare function getObj(): mixed;
function foo() {
  (getObj(): {
    value: string
  }).value.at(-1);
}