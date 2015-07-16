#node-html-chunk-process

This library chunks HTML to a collection of the largest possible blocks of code, delimited by a character length limit, processes these chunks of valid HTML by a passed-in (and optionally asynchronous) processing function, and then returns the processed chunks of HTML after stitching them back together. This is useful when you need to process HTML in an API with a request payload limit, but cannot send invalid chunks of HTML (which would be the case when you would do a naive string split).

##ToDo
- test
- publish to NPM

##Install

    npm install html-chunk-process

##Why?
This is useful when you want to post HTML into an API that has a length limit on the request payload. In many cases you cannot simply split the string because the API wouldn't understand broken chunks of HTML (e.g. when it requires context, such as a translation library). A solution to this problem turns out to be rather complicated, but no worries: html-chunk-process comes to the rescue.

##Illustrative example

Take the following HTML document:

    <!DOCTYPE html>
    <html class="test">
        <head>
          <title>Hi there</title>
        </head>
        <body>
          This is a simple page
          <div>
              and here is more content that exceeds our limit
          </div>
        </body>
    </html>

html-chunk-process(100, processor) breaks the HTML into valid chunks of HTML where each chunk has a total length less than or equal to the given limit. This works by decomposing the HTML into chunks, like so:

    {
        tag: 'root',
        attribs: [],
        children: [
            {
                fragmentPreProcessed: '<!DOCTYPE html>'
                fragmentPostProcessed: '<!DOCTYPE html>'
            }
            {
                tag: 'html',
                attribs: [
                    class: 'test'
                ],
                children: [
                    {
                        fragmentPreProcessed: '<head><title>Hi there</title></head>',
                        fragmentPostProcessed: '<head><title>Ni hao</title></head>'
                    },
                    {
                        tag: 'body',
                        attribs: [],
                        children: [
                            {
                                fragmentPreProcessed: 'This is a simple page',
                                fragmentPostProcessed: 'Zhege page bu hao'
                            },
                            {
                                fragmentPreProcessed: '<div>and here is more content that exceeds our limit</div>',
                                fragmentPostProcessed: '<div>he zhe content women bu yao</div>',
                            }
                        ]
                    }

                ]
            }
        ]
    }

These processed chunks are then stitched back together (and optionally beautified), giving you a processed result like the following:

    <!DOCTYPE html>
    <html class="test">
        <head>
          <title>Ni hao</title>
        </head>
        <body>
          Zhege page bu hao
          <div>
              he zhe content women bu yao
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
          and here is contant that is soo long but doesnt have any children so really there is no way to know how to chunk it in a reliable manner, so we might as well skip it; will not be a problem with typical APIs because those will allow e.g. 10k+ chars
        </body>
    </html>

___example.js___

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
        console.log('result:\n%s\n\nexcluded:\n%j', result, excluded);
    });

    function processAsync(htmlFragment, cb)
    {
        htmlFragment = htmlFragment.replace('Hi there', 'Goodbye').replace('don\'t want', 'want');
        setTimeout(function()
        {
            cb(htmlFragment);
        }, 1000);   
    }

___output (result)___

    <!DOCTYPE html>
    <html class="test">
    <head>
        <title>Goodbye</title>
    </head>
    <body>
        This is a page a simple page
        <div>
            and here is more content we want
        </div>
    </body>
    </html>

___output (excluded)___

    ["and here is contant that is soo long but doesnt have any children so really there is no way to know how to chunk it in a reliable manner, so we might as well skip it; will not be a problem with typical APIs because those will allow e.g. 10k+ chars"]
