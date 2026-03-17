type Result<T> = T | Error;
function handle(x: Result<string>) {
  if (typeof x === 'string') {
    x.at(-1);
  }
}
