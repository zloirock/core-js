import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.keys";
const el = <div {...Object.assign({}, props)} data-keys={Object.keys(props)} />;