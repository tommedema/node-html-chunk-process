var chunkProcess = require('../');
var fs           = require('fs');
var htmlStr      = fs.readFileSync(__dirname + '/input/test1.html', {encoding: 'utf8'});

chunkProcess(100, htmlStr,
    function(htmlFragment, cb)
    {
        return cb(htmlFragment);
    },
    function(err, htmlStrProcessed)
    {
        if (err) return console.error(err);

        //console.log(htmlStrProcessed);
    }
);