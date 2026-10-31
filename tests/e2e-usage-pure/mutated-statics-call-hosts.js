// Each call host must attribute its mutation without help from another installer or cleanup.
import './mutation-cases/call-before-callee-init-host.js';
import './mutation-cases/call-returned-parameter.js';
import './mutation-cases/call-returned-spread-parameter.js';
import './mutation-cases/call-returned-tag-parameter.js';
import './mutation-cases/call-returned-array-wrapper.js';
import './mutation-cases/call-returned-object-wrapper.js';
import './mutation-cases/call-held-returned-parameter.js';
import './mutation-cases/invoked-return-array-tag.js';
import './mutation-cases/invoked-return-object-tag.js';
import './mutation-cases/invoked-free-return-opaque-args.js';
import './mutation-cases/invoked-free-return-caller-shadow.js';
import './mutation-cases/invoked-free-return-array-slot.js';
import './mutation-cases/invoked-return-own-reflect-entry.js';
import './mutation-cases/imported-invoker-local-shadow.js';
import './mutation-cases/invoked-return-import-alias.js';
import './mutation-cases/invocation-yielded-slot-static-patches.js';

import './mutation-cases/invoked-return-before-init.js';
