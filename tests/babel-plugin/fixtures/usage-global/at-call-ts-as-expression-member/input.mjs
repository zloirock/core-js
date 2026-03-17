declare function getObj(): unknown;
function foo() {
  (getObj() as { value: string }).value.at(-1);
}
