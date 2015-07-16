var cheerio = require('cheerio');
var after   = require('after');

function chunkProcessHtml(lengthInt, htmlStr, processorFn, cbFn)
{
    var $ = cheerio.load(htmlStr, { decodeEntities: false });

    decomposeElements(lengthInt, $, $.root(), processorFn, cbFn);
}

function decomposeElements(lengthInt, $, $root, processorFn, cbFn)
{
    var $contents = $root.contents();
    var elements  = [];
    var next      = after($contents.length, cbFn.bind(this, elements));

    $contents.each(function(index, element)
    {
        var $element  = $(element);
        var outerHTML = $.html(element).trim();

        if (outerHTML)
        {
            if (outerHTML.length <= lengthInt)
            {
                processorFn(outerHTML, function(processedHTML)
                {
                    elements.push({
                        fragmentPreProcessed : outerHTML,
                        fragmentPostProcessed: processedHTML
                    });
                    next();
                });
            }
            else if ($element.children().length)
            {
                decomposeElements(lengthInt, $, $element, processorFn, function(children)
                {
                    elements.push({
                        tag     : element.name,
                        attribs : element.attribs,
                        children: children
                    });
                    next();
                });
            }
            else
            {
                next();
            }
        }
        else
        {
            next();
        }
    });
}

module.exports = chunkProcessHtml;