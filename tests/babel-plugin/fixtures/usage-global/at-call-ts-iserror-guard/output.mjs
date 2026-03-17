import "core-js/modules/es.error.cause";
import "core-js/modules/es.error.is-error";
import "core-js/modules/es.string.at";
function foo(x: string | Error) {
  if (Error.isError(x)) {
    // error branch
  } else {
    x.at(-1);
  }
}