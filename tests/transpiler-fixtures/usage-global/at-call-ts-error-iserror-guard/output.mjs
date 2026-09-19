import "core-js/modules/es.error.cause";
import "core-js/modules/es.error.is-error";
import "core-js/modules/es.array.at";
function foo(x: string[] | Error) {
  if (!Error.isError(x)) {
    x.at(-1);
  }
}