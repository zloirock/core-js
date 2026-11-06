// Reading prior pure output preserves lazy access and the nullable coercion path.
// A later argument still runs before parameter binding attempts to read its computed key.
import readAt from '@core-js/pure/actual/instance/at';
const events = [];
const receiver = JSON.parse('null');
export let result;
try {
  (({
    [(events[events.length] = 'key', 'at')]: at
  }, other) => [at, other])((captured => {
    return captured == null ? captured : {
      get at() {
        return readAt(captured);
      }
    };
  })(receiver), events[events.length] = 'argument');
} catch (error) {
  result = [error instanceof TypeError, events];
}