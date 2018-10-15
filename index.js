"use strict";
var Notify = require('notifyjs'),
    jQuery = window.jQuery;

jQuery.notify = Notify;

if (!jQuery.notify) {
    throw new Error('jquery notifyjs plugin not found');
}

/**
 * Notification service
 * Requests to use OS level push notifications, but has
 * jQuery notifyjs fallback for non-supportive OSs.  jQuery notifyjs
 * can also be pushed to direct.  See .push()
 * @property {boolean} isDefault use desktop push notifications or web notification
 * @param {Object} options {}
 */
function Notifier(options) {
    var self = this;
    options = options || {};
    this.queue = [];
    this.maxQueue = options.maxQueue || 500;
    this.isDefault = false; // default to fallback until we know we are supported
    if (window.Notification && !Notify.needsPermission) {
        this.isDefault = true;
    } else if (window.Notification && Notify.isSupported()) {
        Notify.requestPermission(
            function handleNotifyPermGranted() {self.isDefault = true; },
            function handleNotifyPermDenied() {self.isDefault = false; }
        );
    }
    this.defaultTimeout = 5000; // ms
}



/**
 * Pushes a notification to the browser or OS notification service
 * Options should specify a `body` and `type` property.  Supported types are:
 * ['success', 'info', 'warn', 'error'], defaulting to success
 * Options by default are matching those defined for notifyjs
 * https://www.npmjs.com/package/notifyjs, and are otherwise mapped
 * to the similairly named jQuery plugin, http://notifyjs.com/ .
 * To to push directly to jQuery, add `jquery: true` in options.
 * Additional option properties can be defined to override the jQuery fallback
 * defaults: { }
 * Note: default OS push notifications support
 * callbacks, where jQuery notifications do not.
 * @param  {Object}   options
 * @return {Notifier} this
 */
Notifier.prototype.push = function (options) {
    if (!options) {
        throw new Error("options object not specified");
    }
    if (!options.body) {
        throw new Error('notification must contain a body');
    }
    if (!options.className) {
        options.className = 'success';
    }

    // maintain history
    if (this.queue.length >= this.maxQueue) {
        this.queue.shift();
    }
    this.queue.push(options);

    // trigger notification
    if (this.isDefault &&
        !options.alt &&
        !options.alternative &&
        !options.fallback) {
        return this._pushDefault(options);
    }
    return this._pushAlt(options);
};



/**
 * Pushes OS notification
 * @param  {Object} options see .push() for usage
 * @return {Notifier}
 */
Notifier.prototype._pushDefault = function(options) {
    if (!options) {
        throw new Error('no push options provided');
    }
    var notification = new Notify('COINS', {
        body: options.body || null,
        icon: options.icon || (window.location.origin + '/coins_core/graphics/logo-brain-flat.png'),
        tag: options.tag || Date.now(),
        timeout: options.timeout ? (options.timeout/1000) : (this.defaultTimeout/1000),
        notifyShow: options.notifyShow || null,
        notifyClose: options.notifyClose || null,
        notifyClick: options.notifyClick || null,
        notifyError: options.notifyError || null
    });
    notification.show();
    return this;
};



/**
 * Pushes Window notification
 * @param  {Object} options see .push() for usage
 * @return {Notifier}
 */
Notifier.prototype._pushAlt = function(options) {
    if (!options) {
        throw new Error('no push options provided');
    }
    if (!options.position) {
        options.position = 'top center';
    }
    options.autoHideDelay = options.timeout || this.defaultTimeout;
    options.autoHide = options.autoHideDelay ? true : false;
    jQuery.notify(options.body, options);
    return this;
};

module.exports = Notifier;
