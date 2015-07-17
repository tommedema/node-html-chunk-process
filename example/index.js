var chunkProcessHTML = require('../');
var fs               = require('fs');
var inspect          = require('util').inspect;
var originalHTML     = fs.readFileSync(__dirname + '/../test/input/test1.html', {encoding: 'utf8'});

chunkProcessHTML({
    lengthInt   : 100,
    originalHTML: originalHTML,
    beautify    : true,
    processorFn : processAsync
}, function(err, processedHTML, excludedFragments)
{
    console.log(
        'original:\n'   +
        '%s\n\n'        +

        'result:\n'     +
        '%s\n\n'        +

        'excluded:\n'   +
        '%j',

        originalHTML, processedHTML, excludedFragments
    );
});

function processAsync(htmlFragment, cb)
{
    //typically this would invoke an external HTML-digesting API with a payload limit
    htmlFragment = htmlFragment.replace('Hi there', 'Goodbye');
    setTimeout(function()
    {
        cb(htmlFragment);
    }, 1000);   
}