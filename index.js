var cheerio = require('cheerio');

function chunkProcess(lengthInt, htmlStr, processorFn)
{
    var $ = cheerio.load(htmlStr, { decodeEntities: false });

    return decomposeElements(lengthInt, $, $.root(), processorFn);
}

function decomposeElements(lengthInt, $, $root, processorFn)
{
    var $contents = $root.contents();
    var elements  = [];

    $contents.each(function(index, element)
    {
        var $element  = $(element);
        var outerHTML = $.html(element).trim();

        if (outerHTML)
        {
            if (outerHTML.length <= lengthInt)
            {
                elements.push({
                    fragmentPreProcessed: outerHTML,
                    fragmentPostProcessed: processorFn(outerHTML)
                });
            }
            else if ($element.children().length)
            {
                elements.push({
                    tag: element.name,
                    attribs: element.attribs,
                    children: decomposeElements(lengthInt, $, $element, processorFn)
                });
            }
        }
    });
    
    return elements;
}

module.exports = chunkProcess;