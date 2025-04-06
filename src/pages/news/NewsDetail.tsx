import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useAuth} from '../../context/AuthContext'
import ImageCarousel from '../../components/common/ImageCarousel'
import {marked} from 'marked'

interface NewsPost
{
    id: number
    title: string
    content: string
    bannerPhotoUrl?: string
    extraPhotos?: string
    createdAt: string
}

export default function NewsDetail() {
    const {id} = useParams()
    const [post, setPost] = useState<NewsPost | null>(null)
    const [loading, setLoading] = useState(true)
    const {user} = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        fetch(`/api/news/${id}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => setPost(data))
            .finally(() => setLoading(false))
    }, [id])

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return
        const res = await fetch(`/api/news/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
        if (res.ok)
        {
            navigate('/news')
        } else
        {
            alert('Delete failed.')
        }
    }

    const handleEdit = () => {
        if (post)
        {
            navigate(`/news/edit/${post.id}`, {state: post})
        }
    }

    if (loading) return <div className="container">Loading...</div>
    if (!post) return <div className="container">News post not found</div>

    const date = new Date(post.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    let extraImages: string[] = []
    if (post.extraPhotos)
    {
        extraImages = post.extraPhotos.split(',').map((url) => url.trim())
    }

    const renderMarkdown = (content: string) => {
        return {__html: marked.parse(content)};
    };


    return (
        <div className="container news-detail">
            <header className="news-detail-header">
                <h1 className="news-detail-title">{post.title}</h1>
                <time className="news-detail-date">{date}</time>
            </header>

            {post.bannerPhotoUrl && (
                <img
                    src={post.bannerPhotoUrl}
                    alt="Banner"
                    className="news-detail-banner"
                />
            )}

            <article
                className="news-detail-content"
                dangerouslySetInnerHTML={renderMarkdown(post.content)}
            />

            {extraImages.length > 0 && (
                <ImageCarousel images={extraImages} altPrefix="Extra"/>
            )}

            {user && user.role >= 2 && (
                <div className="news-detail-actions">
                    <button className="btn" onClick={handleEdit}>Edit Post</button>
                    <button className="btn" onClick={handleDelete}>Delete Post</button>
                </div>
            )}
        </div>
    )
}
