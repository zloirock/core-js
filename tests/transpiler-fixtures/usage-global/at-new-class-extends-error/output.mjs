import "core-js/modules/es.error.cause";
class MyError extends Error {}
new MyError().at(-1);