import "core-js/modules/es.error.cause";
import "core-js/modules/es.string.at";
try {} catch (e: Error) {
  e.message.at(0);
}