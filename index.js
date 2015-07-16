var cheerio  = require('cheerio');
var after    = require('after');
var beautify = require('js-beautify').html;

function chunkProcessHTML(options, cbFn)
{
    var $original     = cheerio.load(options.htmlStr, { decodeEntities: false });
    var $processed    = cheerio.load('', { decodeEntities: false });
    var processedHTML = '';
    decomposeElements(options.lengthInt, $original, $original.root(), options.processorFn, function(children)
    {
        var fragment = {
            tag     : 'root',
            attribs : {},
            children: children
        };

        var processedHTML = stitchFragment($processed, $processed.root(), fragment).html();

        if (options.beautify)
        {
            processedHTML = beautify(processedHTML, {
                'unformatted' : [],
                'extra_liners': []
            });
        }

        cbFn(processedHTML);
    });
}

function stitchFragment($, $parent, fragment)
{
    if (fragment.tag !== 'root')
    {
        $newParent = $('<' + fragment.tag + '></' + fragment.tag + '>').attr(fragment.attribs);
        $parent.append($newParent);
        $parent = $newParent;
    }

    for (var i = 0, il = fragment.children.length; i < il; i++)
    {
        var child = fragment.children[i];

        if (typeof child.fragmentPostProcessed === 'string')
        {
            $parent.append('\n', child.fragmentPostProcessed);
            if (child.fragmentPostProcessed.indexOf('Hi there') !== -1)
            {
                console.log(child.fragmentPostProcessed);
            }
        }
        else
        {            
            $parent.append(stitchFragment($, $parent, child));
        }
    }

    return $;
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

module.exports = chunkProcessHTML;