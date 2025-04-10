import showdown from 'showdown'

export const markdownConverter = new showdown.Converter({
    tables: true,
    strikethrough: true,
    tasklists: true,
    simplifiedAutoLink: true,
    openLinksInNewWindow: true,
    excludeTrailingPunctuationFromURLs: true,
    literalMidWordUnderscores: true,
    simpleLineBreaks: true,
    requireSpaceBeforeHeadingText: true,
    ghCompatibleHeaderId: true,
    customizedHeaderId: true,
    parseImgDimensions: true,
    extensions: [{
        type: 'output',
        regex: /<a href="([^"]*)">/g,
        replace: '<a href="$1" target="_blank" rel="noopener noreferrer">'
    }]
})
