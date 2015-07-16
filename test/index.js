var chunkProcess = require('../');
var fs           = require('fs');
var inspect      = require('util').inspect;
var htmlStr      = fs.readFileSync(__dirname + '/input/test1.html', {encoding: 'utf8'});

chunkProcess(100, htmlStr,
    function(htmlFragment, cb)
    {
        htmlFragment = htmlFragment.replace('o', '0').replace('a', '@').replace('i', '!');
        setTimeout(function()
        {
            cb(htmlFragment);
        }, 1000);   
    },
    function(result)
    {
        console.log(inspect(result, false, 10));
    }
);