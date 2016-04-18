"use strict";

const debug = require("debug")("incubus:core");
const co = require("co");
const Nightmare = require("nightmare");
const _ = require("lodash");
const async = require("async");
const url = require("url");

Nightmare.action("scrape", function (obj) {
    debug("scrape() started");
    //go through the properties defined on obj.
    //if function, execute the function and populate the result object with the result.
    let promises = [];
    let resultObj = {};

    let opt = {
        startUrl: null,
        beforeScrape: null,
        afterScrape: null,
        linkGatherer: null
    };

    if (_.isString(obj.__startUrl))
        opt.startUrl = obj.__startUrl;

    if (_.isFunction(obj.__beforeScrape))
        opt.beforeScrape = obj.__beforeScrape;

    if (_.isFunction(obj.__afterScrape))
        opt.afterScrape = obj.__afterScrape;

    if (_.isFunction(obj.__linkGatherer))
        opt.linkGatherer = obj.__linkGatherer;

    let self = this;
    let history = [];
    let results = [];

    let scraper = co.wrap(function* (browserUrl) {
        if (opt.beforeScrape)
            yield opt.beforeScrape(self);

        let resultObj = {};
        for (let key in obj) {
            if (key.startsWith("__"))
                continue;

            let value = obj[key];

            if (_.isFunction(value)) {
                try {
                    resultObj[key] = yield self.evaluate_now(value);
                } catch (ex) {
                    resultObj[key] = ex;
                }
                
            }
        }

        var urls = [];
        if (_.isFunction(opt.linkGatherer)) {
            let linkGathererResult = yield self.evaluate_now(opt.linkGatherer);
            if (_.isString(linkGathererResult))
                urls.push(linkGathererResult);
            else if (_.isArray(linkGathererResult))
                urls = linkGathererResult;
        }

        if (opt.afterScrape) {
            let afterScrapeObj = yield opt.afterScrape(self, resultObj, browserUrl, urls, history);
            if (afterScrapeObj)
                resultObj = afterScrapeObj;
        }

        for (let targetUrl of urls) {
            //Convert any relative urls to absolute
            targetUrl = url.resolve(browserUrl, targetUrl);
            if (!targetUrl) {
                debug("Empty or blank target url at %s, skipping.", browserUrl);
                continue;
            }

            let workingOnTask = _.find(q.workersList(), function (task) {
                return task.data.url == targetUrl;
            });
            if (workingOnTask) {
                debug("%s is currently being crawled, skipping.", targetUrl);
                continue;
            }

            let alreadyQueuedTask = _.find(q.tasks, function (task) {
                return task.data.url == targetUrl;
            });
            if (alreadyQueuedTask) {
                debug("%s has already been queued, skipping.", targetUrl);
                continue;
            }

            if (_.indexOf(history, targetUrl) > -1) {
                debug("%s has previously been visited, skipping.", targetUrl);
                continue;
            }

            debug("Queueing %s", targetUrl);
            q.push({
                url: targetUrl
            });
        }

        return resultObj;
    });

    let q = async.queue(function (task, cb) {
        if (!task.url) {
            debug("Task did not specify a url.");
            cb();
            return;
        }

        debug("Scraping " + task.url);

        return co(function* () {

            try {
                var browserUrl = yield self.goto(task.url);
                let result = yield scraper(browserUrl);
                result.__url = browserUrl;
                results.push(result);
                history.push(task.url);

            }
            catch (ex) {
                debug(ex);
            }
            finally {
                cb();
            }
        });
    });
    
    let finalResolve, finalReject;

    // assign a callback
    q.drain = function () {
        debug("Completed crawl.");

        if (results.length == 1)
            finalResolve(results[0]);
        else
            finalResolve(results);
    }

    if (opt.startUrl) {
        let crawlPromise = new Promise(function (resolve, reject) {
            finalResolve = resolve;
            finalReject = reject;
        });
        q.push({
            url: opt.startUrl
        });

        return crawlPromise;
    }
    else
        return scraper();
});