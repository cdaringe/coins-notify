'use strict';
var tape = require('tape');
var domready = require('domready');
domready(function() {

global.jQuery = global.$ = require('jquery');
require('./jq-notify.min.js');
var Notify = require('../index.js');
var n = new Notify();

window.test1 = function (t) {
    n.push({
        body: 'test',
        className: 'info'
    });
    t.ok(true);
    t.end();
};

tape('basic', window.test1);

});
