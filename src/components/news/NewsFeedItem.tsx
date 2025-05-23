import {Link} from 'react-router-dom'
import {markdownConverter} from '../../utils/markdown'
import {NewsPost} from '../../types/NewsPost'

interface Props {
    post: NewsPost
}

const SNIPPET_LENGTH = 150

export default function NewsFeedItem({post}: Props) {
    const snippetText =
        post.content.length > SNIPPET_LENGTH
            ? post.content.substring(0, SNIPPET_LENGTH) + '...'
            : post.content

    const snippetHtml = markdownConverter.makeHtml(snippetText)

    const formattedDate = new Date(post.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })

    return (
        <Link to={`/news/${post.id}`} className="news-item-link">
            <article className="news-feed-item card">
                <header className="news-item-header">
                    <h3 className="news-title">{post.title}</h3>
                    <time className="news-date">{formattedDate}</time>
                </header>

                {post.bannerPhotoUrl && (
                    <img
                        src={post.bannerPhotoUrl}
                        alt={post.title}
                        className="news-banner"
                    />
                )}

                <section className="news-content">
                    <div
                        className="news-snippet"
                        dangerouslySetInnerHTML={{__html: snippetHtml}}
                    />
                </section>
            </article>
        </Link>
    )
}
