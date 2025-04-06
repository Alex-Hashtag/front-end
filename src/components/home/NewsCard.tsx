import {NewsPost} from '../../types/NewsPost'
import {Link} from 'react-router-dom'
import {marked} from 'marked'

interface Props
{
    post: NewsPost
}

export default function NewsCard({post}: Props) {
    const maxLength = 150;
    let excerptMarkdown = post.content;
    if (excerptMarkdown.length > maxLength)
    {
        excerptMarkdown = excerptMarkdown.slice(0, maxLength) + '...';
    }
    const excerptHTML = marked.parse(excerptMarkdown);

    return (
        <Link to={`/news/${post.id}`} className="card">
            {post.bannerPhotoUrl && (
                <div className="card-img-wrapper">
                    <img src={post.bannerPhotoUrl} alt={post.title} className="card-img"/>
                </div>
            )}
            <div className="card-body">
                <h3 className="card-title">{post.title}</h3>
                <div className="card-desc" dangerouslySetInnerHTML={{__html: excerptHTML}}></div>
            </div>
        </Link>
    )
}
