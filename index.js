var cheerio = require('cheerio');

function chunkProcess(lengthInt, htmlStr, processorFn, cbFn)
{
    var $         = cheerio.load(htmlStr, { decodeEntities: false });
    var $root     = $.root();
    var $contents = $root.contents();

    $contents.each(function(index, element)
    {
        var outerHTML = $.html(element).trim();

        if (outerHTML.length > lengthInt)
        {
            console.log('large element: ' + outerHTML);
        }
        else if (outerHTML.length)
        {
            console.log('small element: ' + outerHTML);
        }
    });
    
    return cbFn && cbFn(null, htmlStr);
}

module.exports = chunkProcess;