"use strict";

var debug = require("debug")("incubus:jQuery");
var co = require("co");
var Nightmare = require("nightmare");
var _ = require("lodash");

var jQueryActions = {
    hasJQuery: function () {
        debug("hasJQuery() starting");
        return this.evaluate_now(function () {
            return typeof(jQuery) !== "undefined";
        });
    },

    getJQueryVersion: function() {
        return this.evaluate_now(function () {
            if (typeof(jQuery) === "undefined")
                return undefined;
            else
                return jQuery.fn.jquery;
        });
    },

    /*
     * Looks for the presence of jQuery, and injects it if it has not been defined. Returns the jQuery version number.
     */
    ensureJQuery: function(opts) {
        debug("ensureJQuery() getting jQuery Version");

        opts = _.defaults(opts, {
            noConflict: false,
            removeAll: false,
            jQueryGlobalName: "jQuery"
        });

        var self = this;

        return co(function* () {
            var jQueryVersion = yield self.jQuery.getJQueryVersion();

            if (!jQueryVersion || opts.noConflict) {
                debug("ensureJQuery() jQuery not found - injecting jQuery.");
                yield self.chain()
                    .inject("js", "./node_modules/jquery/dist/jquery.min.js");

                if (opts.noConflict)
                    jQueryVersion = yield self.evaluate_now(function (removeAll, jQueryGlobalName) {
                        window[jQueryGlobalName] = jQuery.noConflict(removeAll);
                        return window[jQueryGlobalName].fn.jquery;
                    }, opts.removeAll, opts.jQueryGlobalName);
                else
                    jQueryVersion = yield self.jQuery.getJQueryVersion();

                debug("ensureJQuery() injected jQuery version " + jQueryVersion);
            }

            if (!jQueryVersion)
                throw "Unable to inject jQuery.";

            return jQueryVersion;
        });
    }
}

Nightmare.action("jQuery", jQueryActions);