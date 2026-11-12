/** @jsxImportSource custom-jsx
 * The next JSX compiler must import the configured runtime after polyfill injection.
 */
import "core-js/modules/es.array.at";
export const view = <box>{[1].at(0)}</box>;