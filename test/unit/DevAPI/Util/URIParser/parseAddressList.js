'use strict';

/* eslint-env node, mocha */

const parseAddressList = require('lib/DevAPI/Util/URIParser/parseAddressList');
const expect = require('chai').expect;

describe('parseAddressList', () => {
    it('should parse a list of addresses with explicit priority', () => {
        expect(parseAddressList('[(address=127.0.0.1, priority=98), (address=[::1], priority=100), (address=localhost, priority=99)]')).to.deep.equal([{
            host: '::1',
            port: undefined,
            socket: undefined
        }, {
            host: 'localhost',
            port: undefined,
            socket: undefined
        }, {
            host: '127.0.0.1',
            port: undefined,
            socket: undefined
        }]);
    });

    it('should parse a list of addresses with implict priority', () => {
        expect(parseAddressList('[[::1], localhost, 127.0.0.1]')).to.deep.equal([{
            host: '::1',
            port: undefined,
            socket: undefined
        }, {
            host: 'localhost',
            port: undefined,
            socket: undefined
        }, {
            host: '127.0.0.1',
            port: undefined,
            socket: undefined
        }]);
    });

    it('should throw an error if neither none or all addresses have explicit priority', () => {
        [
            '[127.0.0.1, (address=[::1], priority=100)]',
            '[(address=127.0.0.1), (address=[::1], 100)]',
            '[(address=127.0.0.1, foo), (address=[::1], priority=100)]'
        ].forEach(invalid => {
            expect(() => parseAddressList(invalid)).to.throw('You must either assign no priority to any of the routers or give a priority for every router');
        });
    });

    it('should throw an error if any address priority is out of bounds', () => {
        [
            '[(address=127.0.0.1, priority=-1), (address=[::1], priority=-2)]',
            '[(address=127.0.0.1, priority=100), (address=[::1], priority=101)]'
        ].forEach(invalid => {
            expect(() => parseAddressList(invalid)).to.throw('The priorities must be between 0 and 100');
        });
    });
});
