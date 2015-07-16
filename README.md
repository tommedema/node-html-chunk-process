#node-html-chunk-process (WIP)

This library chunks HTML to a collection of the largest possible blocks of code, processes these chunks by a custom processor, and then returns the processed chunks after stitching them back together.

##ToDo
- cleanup readme
- test
- publish to NPM

##Install

    npm install html-chunk-process

##Why?
This is useful when you want to post HTML into an API that has a length limit on the request payload. In many cases you cannot simply split the string because the API wouldn't understand broken chunks of HTML. A solution to this problem turns out to be rather complicated, but no worries: html-chunk-process comes to the rescue.

##Example

    <!DOCTYPE html>
    <html class="test">
        <head>
          <title>Hi there</title>
        </head>
        <body>
          This is a page a simple page
          <div>
              and here is more contant we don't want
          </div>
        </body>
    </html>

html-chunk-process(100, processor) should return (intermediary)

    [
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
                            fragmentPreProcessed: 'This is a page a simple page',
                            fragmentPostProcessed: 'Zhege page bu hao'
                        },
                        {
                            fragmentPreProcessed: '<div>and here is more contant we don't want</div>',
                            fragmentPostProcessed: '<div>he zhe content women bu yao</div>',
                        }
                    ]
                }

            ]
        }
    ]

and finally

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
If an element has no children but exceeds the limit length it is not included in the result (because there is no reliable way to chunk it).