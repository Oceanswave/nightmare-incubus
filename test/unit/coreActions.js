"use strict";

require('mocha-generators').install();

const Nightmare = require("nightmare");
require('../../actions/core');

describe('nightmare-incubus', function () {
    describe('coreActions', function () {
        let nightmare;

        beforeEach(function* () {
            nightmare = new Nightmare();
            yield nightmare.init();
        });

        afterEach(function () {
            nightmare.end();
        });

        it('should support scraping', function* () {

            yield nightmare.chain()
                .goto(fixture('scrape'))
                .jQuery.ensureJQuery();

            let data = yield nightmare.scrape({
                headings: function () {
                    return jQuery("#text__headings h1").text();
                },
                tableFooter4: function () {
                    return jQuery("#text__tables tfoot tr th:eq(3)").text();
                },
                anchors: function () {
                    return jQuery("a").attr("href");
                }
            });

            data.should.deep.equal({
                headings: "HeadingsHeading 1",
                tableFooter4: 'Table Footer 4',
                anchors: '#text'
            });
        });

        it('should support specifying a start url', function* () {

            yield nightmare.init();

            yield nightmare.scrape({
                __startUrl: fixture('scrape')
            });

            let title = yield nightmare.title();
            title.should.equal("HTML5 Test Page");
        });

        it('should support specifying a before scrape function', function* () {

            yield nightmare.init();

            yield nightmare.scrape({
                __startUrl: fixture('scrape'),
                __beforeScrape: function* (nightmare) {
                    yield nightmare.jQuery.ensureJQuery();
                }
            });

            let ver = yield nightmare.jQuery.getJQueryVersion();
            ver.should.equal("2.2.3");
        });

        it('should support specifying an after scrape function', function* () {

            yield nightmare.init();

            let result = yield nightmare.scrape({
                __startUrl: fixture('scrape'),
                __beforeScrape: function* (nightmare) {
                    yield nightmare.jQuery.ensureJQuery();
                },
                title: function () {
                    return jQuery('title').text();
                },
                __afterScrape: function* (nightmare, data) {
                    data.title += " Foo";
                }
            });

            result.should.deep.equal({
                __url: fixture('scrape') + "/",
                title: "HTML5 Test Page Foo"
            });
        });

        it('should support scraping multiple urls', function* () {

            yield nightmare.init();

            let result = yield nightmare.scrape({
                __startUrl: fixture('scrape'),
                __beforeScrape: function* (nightmare) {
                    yield nightmare.jQuery.ensureJQuery();
                },
                __linkGatherer: function () {
                    let result = [];
                    jQuery(".links a").each(function (ix, elem) {
                        result.push(jQuery(elem).attr("href"));
                    });
                    return result;
                },
                title: function () {
                    return jQuery('title').text();
                },
                __afterScrape: function* (nightmare, data, browserUrl, urls) {
                }
            });

            result.should.deep.equal([
                {
                    __url: fixture("scrape") + "/",
                    title: "HTML5 Test Page"
                },
                {
                    __url: fixture("scrape") + "/one.html",
                    title: "One"
                },
                {
                    __url: fixture("scrape") + "/two.html",
                    title: "Two"
                },
                {
                    __url: fixture("scrape") + "/three.html",
                    title: "Three"
                }
            ]);
        });
    });
});