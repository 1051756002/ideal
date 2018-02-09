var ProtoBuf = require('protobuf');
var LXUtil = require('LXUtil');

var Class = cc.Class({
	name: 'LXVideoMessager',

	statics: {
		initialized: false,

		init: function(callback) {
			if (this.initialized) {
				callback && callback();
			};

			var total = 1;
			var done = function() {
				if (--total <= 0) {
					this.initialized = true;
					callback && callback();
				}
			}.bind(this);
		},
	},

	ctor: function() {
		this.connector = null;
	},

	send: function(type, data) {

	},

	emit: function(message, detail) {

	},
});

module.exports = Class;
