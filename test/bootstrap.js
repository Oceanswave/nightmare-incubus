"use strict";
/**
 * Module dependencies.
 */

require('mocha-generators').install();
const url = require('url');
const server = require('./server');

const chai = require('chai');
global.should = chai.should();
global.expect = chai.expect;

/**
 * Locals.
 */

var base = 'http://localhost:7500/';

before(function (done) {
    server.listen(7500, done);
});

/**
 * Generate a URL to a specific fixture.
 *
 * @param {String} path
 * @returns {String}
 */
global.fixture = function (path) {
    return url.resolve(base, path);
};