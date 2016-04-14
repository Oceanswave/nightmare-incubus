"use strict";
/**
 * Module dependencies.
 */

require('mocha-generators').install();

var Nightmare = require("nightmare");
require('..');

var chai = require('chai');
var url = require('url');
var server = require('./server');
var should = chai.should();
var expect = chai.expect;

/**
 * Locals.
 */

var base = 'http://localhost:7500/';

describe('nightmare-incubus', function () {

    before(function (done) {
        server.listen(7500, done);
    });

    describe('jquery', function () {
        var nightmare;

        beforeEach(function* () {
            nightmare = new Nightmare();
            yield nightmare.init();
        });

        afterEach(function* () {
            nightmare.end();
        });

        it('should not detect presence of jQuery', function* () {
            var hasJQuery = yield nightmare.chain()
                .goto(fixture('nojquery'))
                .jQuery.hasJQuery();

            hasJQuery.should.equal(false);

        });

        it('should detect presence of jQuery', function* () {

            var hasJQuery = yield nightmare.chain()
                .goto(fixture('jquery'))
                .jQuery.hasJQuery();

            hasJQuery.should.equal(true);
        });

        it('should get jQuery version number', function* () {

            var jQueryVersion = yield nightmare.chain()
                .goto(fixture('jquery'))
                .jQuery.getJQueryVersion();

            jQueryVersion.should.equal("2.2.1");
        });

        it('should get undefined when jquery not present', function* () {

            var jQueryVersion = yield nightmare.chain()
                .goto(fixture('nojquery'))
                .jQuery.getJQueryVersion();

            expect(jQueryVersion).to.be.undefined;
        });

        it('should ensure the presence of jQuery', function* () {
            var jQueryVersion = yield nightmare.chain()
                .goto(fixture('nojquery'))
                .jQuery.ensureJQuery();

            jQueryVersion.should.equal("2.2.3");
        });

        it('should not override the presence of an existing jQuery', function* () {
            var jQueryVersion = yield nightmare.chain()
                .goto(fixture('jquery'))
                .jQuery.ensureJQuery();

            jQueryVersion.should.equal("2.2.1");
        });

        it('should allow jQuery to relinquish control of $ variable', function* () {
            var jQueryVersion = yield nightmare.chain()
                .goto(fixture('jquery'))
                .jQuery.ensureJQuery({ noConflict: true, removeAll: true, jQueryGlobalName: 'jQuery222' })
                .jQuery.getJQueryVersion();

            jQueryVersion.should.equal("2.2.1");

            var jQuery222Version = yield nightmare.evaluate(function () {
                return jQuery222.fn.jquery;
            });

            jQuery222Version.should.equal("2.2.3");
        });
    });

    describe('urijs', function () {
        var nightmare;

        beforeEach(function* () {
            nightmare = new Nightmare();
            yield nightmare.init();
        });

        afterEach(function* () {
            nightmare.end();
        });

        it('should inject urijs', function* () {
            var urijs = yield nightmare.chain()
                .goto(fixture('nojquery'))
                .urijs.injectURIJS();

            urijs.should.equal(true);
        });
    });

    describe('coreActions', function () {
        var nightmare;

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

            var data = yield nightmare.scrape({
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
    });
});

/**
 * Generate a URL to a specific fixture.
 *
 * @param {String} path
 * @returns {String}
 */

function fixture(path) {
    return url.resolve(base, path);
}
