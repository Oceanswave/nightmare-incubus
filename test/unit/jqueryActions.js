"use strict";

require('mocha-generators').install();

const Nightmare = require("nightmare");
require('../../actions/jquery');

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;

describe('nightmare-incubus', function () {
    describe('jquery', function () {
        let nightmare;

        beforeEach(function* () {
            nightmare = new Nightmare();
            yield nightmare.init();
        });

        afterEach(function* () {
            nightmare.end();
        });

        it('should not detect presence of jQuery', function* () {
            let hasJQuery = yield nightmare.chain()
                .goto(fixture('nojquery'))
                .jQuery.hasJQuery();

            hasJQuery.should.equal(false);

        });

        it('should detect presence of jQuery', function* () {

            let hasJQuery = yield nightmare.chain()
                .goto(fixture('jquery'))
                .jQuery.hasJQuery();

            hasJQuery.should.equal(true);
        });

        it('should get jQuery version number', function* () {

            let jQueryVersion = yield nightmare.chain()
                .goto(fixture('jquery'))
                .jQuery.getJQueryVersion();

            jQueryVersion.should.equal("2.2.1");
        });

        it('should get undefined when jquery not present', function* () {

            let jQueryVersion = yield nightmare.chain()
                .goto(fixture('nojquery'))
                .jQuery.getJQueryVersion();

            expect(jQueryVersion).to.be.undefined;
        });

        it('should ensure the presence of jQuery', function* () {
            let jQueryVersion = yield nightmare.chain()
                .goto(fixture('nojquery'))
                .jQuery.ensureJQuery();

            jQueryVersion.should.equal("2.2.3");
        });

        it('should not override the presence of an existing jQuery', function* () {
            let jQueryVersion = yield nightmare.chain()
                .goto(fixture('jquery'))
                .jQuery.ensureJQuery();

            jQueryVersion.should.equal("2.2.1");
        });

        it('should allow jQuery to relinquish control of $ variable', function* () {
            let jQueryVersion = yield nightmare.chain()
                .goto(fixture('jquery'))
                .jQuery.ensureJQuery({ noConflict: true, removeAll: true, jQueryGlobalName: 'jQuery222' })
                .jQuery.getJQueryVersion();

            jQueryVersion.should.equal("2.2.1");

            let jQuery222Version = yield nightmare.evaluate(function () {
                return jQuery222.fn.jquery;
            });

            jQuery222Version.should.equal("2.2.3");
        });
    });
});