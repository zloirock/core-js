import "core-js/modules/es.error.cause";
class MyError extends window.Error {}
new MyError().at(-1);