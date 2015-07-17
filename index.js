var cheerio  = require('cheerio');
var after    = require('after');
var beautify = require('js-beautify').html;
var extend   = require('node.extend');

function chunkProcessHTML(options, cbFn)
{
    var $oDOM         = cheerio.load(options.originalHTML, { decodeEntities: false });
    var $tDOM         = cheerio.load('', { decodeEntities: false });
    var processedHTML = '';
    decomposeElements(options.lengthInt, $oDOM, $oDOM.root(), options.processorFn, function(children, excluded)
    {
        var fragment = {
            tag     : 'root',
            attribs : {},
            children: children
        };

        var processedHTML = stitchFragment($tDOM, $tDOM.root(), fragment).html();

        if (options.beautify)
        {
            processedHTML = beautify(processedHTML, extend({
                'unformatted' : [],
                'extra_liners': []
            }, options.beautifyOptions || {}));
        }

        cbFn(null, processedHTML, excluded);
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
    var excluded  = [];
    var next      = after($contents.length, cbFn.bind(this, elements, excluded));

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
                decomposeElements(lengthInt, $, $element, processorFn, function(children, _excluded)
                {
                    elements.push({
                        tag     : element.name,
                        attribs : element.attribs,
                        children: children
                    });
                    
                    for (var i = 0, il = _excluded.length; i < il; i++)
                    {
                        excluded.push(_excluded[i]);
                    }

                    next();
                });
            }
            else
            {
                excluded.push(outerHTML);
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