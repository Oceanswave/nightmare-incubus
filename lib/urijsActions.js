"use strict";

var debug = require("debug")("incubus:urijs");
var co = require("co");
var Nightmare = require("nightmare");

var uriJsActions = {
    injectURIJS: function () {
        debug("injectURIAsync() started");
        var self = this;
        return co(function* () {
            yield self.inject("js", "./node_modules/urijs/src/URI.min.js");
            var result = yield self.evaluate_now(function () {
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

Nightmare.action("urijs", uriJsActions);