let ideal = {};

ideal.util = require('./util');
ideal.config = require('./config');

window.ideal = ideal;
window.util = ideal.util;
window.config = ideal.config;

util.log(util.format('Version: {1}', config.version));
