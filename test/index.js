var chunkProcess = require('../');
var fs           = require('fs');
var inspect      = require('util').inspect;
var htmlStr      = fs.readFileSync(__dirname + '/input/test1.html', {encoding: 'utf8'});

chunkProcess({
    lengthInt  : 100,
    htmlStr    : htmlStr,
    beautify   : true,
    processorFn: processAsync
}, function(err, result, excluded)
{
    console.log('original:\n%s\n\nresult:\n%s\n\nexcluded:\n%j', htmlStr, result, excluded);
});

function processAsync(htmlFragment, cb)
{
    htmlFragment = htmlFragment.replace('Hi there', 'Goodbye');
    setTimeout(function()
    {
        cb(htmlFragment);
    }, 1000);   
}