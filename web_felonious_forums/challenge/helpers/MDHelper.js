const showdown        = require('showdown')
const createDOMPurify = require('dompurify');
const { JSDOM }       = require('jsdom');

const conv = new showdown.Converter({
	completeHTMLDocument: false,
	tables: true,
	ghCodeBlocks: true,
	simpleLineBreaks: true,
	strikethrough: true,
	metadata: false,
	emoji: true
});

const filterInput = (userInput) => {
    window = new JSDOM('').window;
    DOMPurify = createDOMPurify(window);
    return DOMPurify.sanitize(userInput, {ALLOWED_TAGS: ['strong', 'em', 'img', 'a', 's', 'ul', 'ol', 'li']});
}

const makeHTML = (markdown) => {
    return conv.makeHtml(markdown);
}

module.exports = {
    filterInput,
	makeHTML
};