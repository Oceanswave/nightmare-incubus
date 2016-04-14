"use strict";

var debug = require("debug")("incubus:core");
var co = require("co");
var Nightmare = require("nightmare");
var _ = require("lodash");

Nightmare.action("scrape", function (obj) {
    debug("scrape() started");
    //go through the properties defined on obj.
    //if function, execute the function and populate the result object with the result.
    let promises = [];
    let resultObj = {};

    for (let key in obj) {
        let value = obj[key];

        if (_.isFunction(value)) {
            let p = this.evaluate_now(value)
                .then(function (result) {
                    resultObj[key] = result;
                }, function (err) {
                    resultObj[key] = err;
                });

            promises.push(p);
        }
    }

    return co(function* () {
        yield Promise.all(promises);
        return resultObj;
    });
});