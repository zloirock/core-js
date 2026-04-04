import "core-js/modules/es.string.at";
function foo({
  key
}: {
  [string]: string
}) {
  key.at(-1);
}