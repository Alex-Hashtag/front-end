import { useEffect, useState } from 'react';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import '../../styles/markdown-editor.css';

// Initialize Markdown parser with improved code block handling
const mdParser = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
    highlight: function (str, lang) {
        // Simple syntax highlighting for code blocks
        if (lang) {
            try {
                // Add syntax classes based on language
                return `<pre class="code-block language-${lang}"><code class="language-${lang}">${str}</code></pre>`;
            } catch (error) {
                console.error("Error highlighting code:", error);
            }
        }
        
        // Use default highlighting
        return `<pre class="code-block"><code>${str}</code></pre>`;
    }
});

// Add underline support
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

// Enable tables by default
mdParser.enable('table');

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    height?: number;
    placeholder?: string;
}

export default function CommonMarkdownEditor({
    value,
    onChange,
    height = 300,
    placeholder = 'Write your content here...',
}: MarkdownEditorProps) {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [isMobile, setIsMobile] = useState(false);
    const [mobileView, setMobileView] = useState<'md' | 'html'>('md');

    // Detect theme changes
    useEffect(() => {
        const isDark = document.body.classList.contains('dark');
        setTheme(isDark ? 'dark' : 'light');

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const isDarkNow = document.body.classList.contains('dark');
                    setTheme(isDarkNow ? 'dark' : 'light');
                }
            });
        });

        observer.observe(document.body, { attributes: true });

        return () => observer.disconnect();
    }, []);

    // Detect if mobile view
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth <= 480);
        };

        // Initial check
        checkIsMobile();

        // Add event listener
        window.addEventListener('resize', checkIsMobile);

        // Clean up
        return () => {
            window.removeEventListener('resize', checkIsMobile);
        };
    }, []);

    const handleEditorChange = ({ text }: { text: string }) => {
        onChange(text);
    };

    // Custom components for mobile view
    const renderMobileToggle = () => {
        if (!isMobile) return null;

        return (
            <div className="mobile-toggle-view">
                <button 
                    className={mobileView === 'md' ? 'active' : ''} 
                    onClick={() => setMobileView('md')}
                >
                    Edit
                </button>
                <button 
                    className={mobileView === 'html' ? 'active' : ''} 
                    onClick={() => setMobileView('html')}
                >
                    Preview
                </button>
            </div>
        );
    };

    // Get view configuration based on device
    const getViewConfig = () => {
        if (isMobile) {
            return {
                md: mobileView === 'md',
                html: mobileView === 'html',
                menu: true,
            };
        }

        return {
            menu: true,
            md: true,
            html: true,
        };
    };

    // Get editor height based on device
    const getEditorHeight = () => {
        if (isMobile) {
            // Taller on mobile when stacked
            return height * 1.5;
        }
        return height;
    };

    return (
        <div className="markdown-editor-wrapper">
            {renderMobileToggle()}
            <MdEditor
                value={value}
                style={{ height: `${getEditorHeight()}px` }}
                renderHTML={(text) => mdParser.render(text)}
                onChange={handleEditorChange}
                placeholder={placeholder}
                plugins={[
                    'header',
                    'font-bold',
                    'font-italic',
                    'font-underline',
                    'font-strikethrough',
                    'list-unordered',
                    'list-ordered',
                    'block-quote',
                    'block-code-inline',
                    'block-code-block',
                    'link',
                    'image',
                    'clear',
                    'logger',
                    'mode-toggle',
                    'full-screen'
                ]}
                config={{
                    view: getViewConfig(),
                    canView: {
                        menu: true,
                        md: true,
                        html: true,
                        fullScreen: true,
                        hideMenu: true,
                    },
                    table: {
                        maxRow: 10,
                        maxCol: 10,
                    },
                    syncScrollMode: ['rightFollowLeft', 'leftFollowRight'],
                    imageUrl: 'https://octodex.github.com/images/minion.png',
                    htmlClass: 'custom-html-style', // This class will be applied to the HTML preview area
                }}
                shortcuts={true}
                // Apply theme class based on current theme
                className={`markdown-editor ${theme === 'dark' ? 'dark-theme' : 'light-theme'} ${isMobile ? 'mobile-view' : ''}`}
            />
        </div>
    );
}
