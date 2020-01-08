var RoonApi = require("node-roon-api");

var roon = new RoonApi({
    extension_id:        'com.elvis.test',
    display_name:        "Elvis's First Roon API Test",
    display_version:     "1.0.0",
    publisher:           'Elvis Presley',
    email:               'elvis@presley.com',
    website:             'https://github.com/elvispresley/roon-extension-test'
});

