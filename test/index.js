var chunkProcess = require('../');
var fs           = require('fs');
var inspect      = require('util').inspect;
var htmlStr      = fs.readFileSync(__dirname + '/input/test1.html', {encoding: 'utf8'});

var result = chunkProcess(100, htmlStr,
    function(htmlFragment)
    {
        return htmlFragment;
    }
);

console.log(inspect(result, false, 10));