"use strict";

var Protocol = require('./Protocol');
var PlainAuth = require('./Authentication/PlainAuth');

function Session(properties, globals) {
    this._properties = properties;
    this._globals = globals;

    /* TODO - these two should be grouped in a "Connection" object, so that a "Session" can switch between Conenctions */
    this._protocol = false;
    this._serverCapabilities = {};
}

module.exports = Session;

Session.prototype.connect = function () {
    var self = this;

    return new Promise(function (resolve, fail) {
        self._globals.getSocketFactory().createSocket(self._properties).then(function (conn) {
            self._protocol = new Protocol(conn, self._globals);
            return self._protocol.handshake(self._properties);
        }).then(function (serverCapabilities) {
            self._serverCapabilities = serverCapabilities;

            var auth = new PlainAuth(self._properties);
            if (!auth.verifyServer(self._serverCapabilities['authentication.mechanisms'])) {
                throw new Error("Can't do PLAIN auth with this server");
            }

            return self._protocol.authenticate(auth);
        }).then(function () {
            resolve(self);
        }).catch(function (err) {
            fail(err);
        });
    });
};

Session.prototype.find = function (schema, collection, rowcb, metacb) {
    return this._protocol.crudFind(this, schema, collection, rowcb, metacb);
};

Session.prototype.close = function () {
    this._protocol.close();
};