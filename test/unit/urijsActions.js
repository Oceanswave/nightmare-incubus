"use strict";

require('mocha-generators').install();

const Nightmare = require("nightmare");
require('../../actions/urijs');

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;

describe('nightmare-incubus', function() {

    describe('urijs', function () {
        let nightmare;
        
        beforeEach(function* () {
            nightmare = new Nightmare();
            yield nightmare.init();
        });

        afterEach(function* () {
            nightmare.end();
        });

        it('should inject urijs', function* () {

            let urijs = yield nightmare.chain()
                .goto(fixture('nojquery'))
                .urijs.injectURIJS();

            urijs.should.equal(true);
        });
    });

});