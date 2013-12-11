var util = require('util');
var PromiseEvent = require('./PromiseEvent');

util.inherits(ActivateEvent, PromiseEvent);
module.exports = ActivateEvent;

function ActivateEvent(resolve, reject) {
    PromiseEvent.call(this, 'activate', resolve, reject);
}