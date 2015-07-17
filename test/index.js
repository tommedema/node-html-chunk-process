var assert           = require('assert');
var chunkProcessHTML = require('../');
var fs               = require('fs');
var originalHTML     = fs.readFileSync(__dirname + '/input/test1.html', {encoding: 'utf8'});
var outputHTML       = fs.readFileSync(__dirname + '/output/test1.html', {encoding: 'utf8'});

describe('html-chunk-process', function()
{
    it('should process chunks', function(done)
    {

        function processAsync(htmlFragment, cb)
        {
            //typically this would invoke an external HTML-digesting API with a payload limit
            htmlFragment = htmlFragment.replace('Hi there', 'It works').replace('don\'t', 'do');
            process.nextTick(function()
            {
                cb(htmlFragment);
            });
        }

        chunkProcessHTML({
            lengthInt   : 100,
            originalHTML: originalHTML,
            beautify    : true,
            processorFn : processAsync
        }, function(err, processedHTML, excludedFragments)
        {
            assert.equal(err, null);
            assert.equal(processedHTML.replace(/\s/g, ''), outputHTML);
            done();
        });

    });
});