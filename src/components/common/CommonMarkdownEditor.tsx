import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';


const mdParser = new MarkdownIt();


mdParser.inline.ruler.after('emphasis', 'underline', (state, silent) => {
    const start = state.pos;
    const max = state.posMax;

    // Check for starting "++"
    if (state.src.charCodeAt(start) !== 0x2B /* + */ ||
        state.src.charCodeAt(start + 1) !== 0x2B)
    {
        return false;
    }

    const contentStart = start + 2;
    let contentEnd = contentStart;

    // Search for closing "++"
    while (contentEnd + 1 < max)
    {
        if (state.src.charCodeAt(contentEnd) === 0x2B &&
            state.src.charCodeAt(contentEnd + 1) === 0x2B)
        {
            if (!silent)
            {
                state.push('underline_open', 'u', 1);
                const tokenText = state.push('text', '', 0);
                tokenText.content = state.src.slice(contentStart, contentEnd);
                state.push('underline_close', 'u', -1);
            }

            // Update position to continue parsing after closing ++
            state.pos = contentEnd + 2;
            return true;
        }
        contentEnd++;
    }

    return false;
});

interface MarkdownEditorProps
{
    value: string;
    onChange: (value: string) => void;
    height?: number;
}

export default function CommonMarkdownEditor({
                                                 value,
                                                 onChange,
                                                 height = 300,
                                             }: MarkdownEditorProps)
{

    const handleEditorChange = ({text}: { text: string }) => {
        onChange(text);
    };

    return (
        <div className="markdown-editor-wrapper">
            <MdEditor
                value={value}
                style={{height: `${height}px`}}
                renderHTML={(text) => mdParser.render(text)}
                onChange={handleEditorChange}
            />
        </div>
    );
}
