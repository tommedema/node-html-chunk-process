var chunkProcessHTML = require('../');
var fs               = require('fs');
var originalHTML     = fs.readFileSync(__dirname + '/input.html', {encoding: 'utf8'});

chunkProcessHTML({
    lengthInt   : 100,
    originalHTML: originalHTML,
    beautify    : true,
    processorFn : processAsync
}, function(err, processedHTML, excludedFragments, decomposed)
{

    fs.writeFileSync(__dirname + '/output.txt', processedHTML);
    
    console.log(
        'decomposed:\n'   +
        '%j\n\n'        +

        'original:\n'   +
        '%s\n\n'        +

        'result:\n'     +
        '%s\n\n'        +

        'excluded:\n'   +
        '%j',

        decomposed, originalHTML, processedHTML, excludedFragments
    );
});

function processAsync(htmlFragment, cb)
{
    //typically this would invoke an external HTML-digesting API with a payload limit
    htmlFragment = htmlFragment.replace('Hi there', 'It works').replace('don\'t', 'do');
    setTimeout(function()
    {
        cb(htmlFragment);
    }, 1000);
}