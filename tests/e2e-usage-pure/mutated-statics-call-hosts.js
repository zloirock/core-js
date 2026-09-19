// Each call host must attribute its mutation without help from another installer or cleanup.
import './mutation-cases/call-constructor-host.js';
import './mutation-cases/call-iife-host.js';
import './mutation-cases/call-tag-host.js';
import './mutation-cases/call-call-host.js';
import './mutation-cases/call-apply-host.js';
import './mutation-cases/call-reflect-apply-host.js';
import './mutation-cases/call-bind-host.js';
import './mutation-cases/call-returned-parameter.js';
import './mutation-cases/call-returned-spread-parameter.js';
import './mutation-cases/call-returned-tag-parameter.js';
import './mutation-cases/call-returned-array-wrapper.js';
import './mutation-cases/call-returned-object-wrapper.js';
import './mutation-cases/call-arguments-parameter.js';
import './mutation-cases/call-arguments-alias-parameter.js';
import './mutation-cases/call-held-parameter.js';
import './mutation-cases/call-held-returned-parameter.js';
import './mutation-cases/invoked-return-array-tag.js';
import './mutation-cases/invoked-return-object-tag.js';
import './mutation-cases/invoked-free-return-opaque-args.js';
import './mutation-cases/invoked-free-return-caller-shadow.js';
import './mutation-cases/invoked-free-return-array-slot.js';
import './mutation-cases/invoked-return-own-reflect-entry.js';
import './mutation-cases/imported-invoker-local-shadow.js';
import './mutation-cases/invoked-return-import-alias.js';

import './mutation-cases/invoked-return-before-init.js';
