#node-html-chunk-process

Do you need to access an HTML-digesting API with a request payload limit? Distributing your payload across multiple requests is incredibly complex in this case, since HTML defines a hierarchical structure that cannot be split in a linear way without breaking context.

This library aims to help by chunking a HTML document (defined as a string) to a collection of the largest possible blocks of valid HTML (where a character length limit defines the boundary). Each chunk is then processed by a passed-in asynchronous processing function (which typically invokes your external API), after which the processed chunks are intelligently stitched back together.

##Install

    npm install html-chunk-process

##Why?
This is useful when you need to process HTML using an API with a request payload limit (such as a translation library), but cannot send invalid chunks of HTML or when the APIs effectiveness requires context. A naive string split does not account for either of these cases, but html-chunk-process does.

##Illustrative example

Take the following HTML document:

    <!DOCTYPE html>
    <html class="test">
        <head>
          <title>Hi there</title>
        </head>
        <body>
          This is a page a simple page
          <div>
              and here is more content we don't want
          </div>
          Here is content that is very long but doesnt have any children. Really there is no way to know how to chunk it in a reliable, cross-script, and cross-language manner. Skipping this fragment should not be a problem with typical APIs because those will allow over thousands of characters, at which point this would not be a fragment without children.
        </body>
    </html>

`html-chunk-process` breaks the HTML into valid chunks of HTML where each chunk has a total length less than or equal to the given limit. This works by decomposing the HTML into chunks, like so (with a length limit of 100, although typically the limit would be much greater, such as 10k characters):

    {
        tag: 'root',
        attribs: {},
        children: [{
            fragmentPreProcessed: '<!DOCTYPE html>',
            fragmentPostProcessed: '<!DOCTYPE html>'
        }, {
            tag: 'html',
            attribs: {
                class: 'test'
            },
            children: [{
                fragmentPreProcessed: '<head>\n      <title>Hi there</title>\n    </head>',
                fragmentPostProcessed: '<head>\n      <title>Goodbye</title>\n    </head>'
            }, {
                tag: 'body',
                attribs: {},
                children: [{
                    fragmentPreProcessed: 'This is a page a simple page',
                    fragmentPostProcessed: 'This is a page a simple page'
                }, {
                    fragmentPreProcessed: '<div>\n          and here is more content we don\'t want\n      </div>',
                    fragmentPostProcessed: '<div>\n          and here is more content we don\'t want\n      </div>'
                }]
            }]
        }]
    }

These processed chunks are then stitched back together (and optionally beautified when `beautify: true` is passed as an option), giving you a processed result like the following:

    <!DOCTYPE html>
    <html class="test">
    <head>
        <title>It works</title>
    </head>
    <body>
        This is a page a simple page
        <div>
            and here is more content we do want
        </div>
    </body>
    </html>

##Note
If an element has no children but exceeds the limit length it is not included in the result (because there is no reliable way to chunk it). However, all excluded elements are returned as a third parameter in the callback function. See the following code example.

##Code example

___test1.html___

    <!DOCTYPE html>
    <html class="test">
        <head>
          <title>Hi there</title>
        </head>
        <body>
          This is a page a simple page
          <div>
              and here is more content we don't want
          </div>
          Here is content that is very long but doesnt have any children. Really there is no way to know how to chunk it in a reliable, cross-script, and cross-language manner. Skipping this fragment should not be a problem with typical APIs because those will allow over thousands of characters, at which point this would not be a fragment without children.
        </body>
    </html>

___example/index.js___

    var chunkProcessHTML = require('../');
    var fs               = require('fs');
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
        htmlFragment = htmlFragment.replace('Hi there', 'It works').replace('don\'t', 'do');
        setTimeout(function()
        {
            cb(htmlFragment);
        }, 1000);   
    }

___output (result)___

    <!DOCTYPE html>
    <html class="test">
    <head>
        <title>It works</title>
    </head>
    <body>
        This is a page a simple page
        <div>
            and here is more content we do want
        </div>
    </body>
    </html>

___output (excluded)___

    ["Here is content that is very long but doesnt have any children. Really there is no way to know how to chunk it in a reliable, cross-script, and cross-language manner. Skipping this fragment should not be a problem with typical APIs because those will allow over thousands of characters, at which point this would not be a fragment without children."]

##Test

    npm test

Tests require mocha. The current tests are very minimal, feel free to add more tests and submit a pull request.