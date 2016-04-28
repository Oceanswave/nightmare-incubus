"use strict";

const debug = require("debug")("incubus:jQuery");
const co = require("co");
const Nightmare = require("nightmare");
const _ = require("lodash");

Nightmare.prototype.jQuery = class {
    /*
    * Returns a value that indicates if jQuery is currently loaded.
    */
    hasJQuery() {
        debug("hasJQuery() starting");
        return this.evaluate_now(function () {
            return typeof (jQuery) !== "undefined";
        });
    }

    /*
    * Returns the verision of jQuery currently loded, or undefined if jQuery is not loaded.
    */
    getJQueryVersion() {
        return this.evaluate_now(function () {
            if (typeof (jQuery) === "undefined")
                return undefined;
            else
                return jQuery.fn.jquery;
        });
    };

    /*
     * Looks for the presence of jQuery, and injects it if it has not been defined. Returns the jQuery version number.
     */
    ensureJQuery(opts) {
        debug("ensureJQuery() getting jQuery Version");

        opts = _.defaults(opts, {
            noConflict: false,
            removeAll: false,
            jQueryGlobalName: "jQuery"
        });

        let self = this;
        
        return co(function* () {
            let jQueryVersion = yield self.jQuery.getJQueryVersion();

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
};

Nightmare.registerNamespace("jQuery");