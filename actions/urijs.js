"use strict";

const debug = require("debug")("incubus:urijs");
const co = require("co");
const Nightmare = require("nightmare");

Nightmare.prototype.urijs = class {
    injectURIJS() {
        debug("injectURIAsync() started");
        let self = this;
        return co(function* () {
            yield self.inject("js", "./node_modules/urijs/src/URI.min.js");
            let result = yield self.evaluate_now(function () {
                return typeof URI === "function";
            });

            if (result === true)
                debug("injectURIAsync() injected URI");
            else
                debug("injectURIAsync() unable to inject URI");

            return result;
        });
    }
};

Nightmare.registerNamespace("urijs");