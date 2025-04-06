import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth} from '../../context/AuthContext'
import NewsFeedItem from '../../components/news/NewsFeedItem'

interface NewsPost
{
    id: number
    title: string
    content: string
    bannerPhotoUrl?: string
    extraPhotos?: string
    createdAt: string
}

interface PaginatedNews
{
    content: NewsPost[]
    totalPages: number
    totalElements: number
    number: number
}

export default function NewsList() {
    const [news, setNews] = useState<NewsPost[]>([])
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(true)
    const {user} = useAuth()
    const navigate = useNavigate()

    const loadNewsPage = (pageNumber: number) => {
        setLoading(true)
        fetch(`/api/news?page=${pageNumber}&size=10`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch")
                return res.json()
            })
            .then((data: PaginatedNews) => {
                const sorted = data.content.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
                if (pageNumber === 0)
                {
                    setNews(sorted)
                } else
                {
                    setNews(prev => [...prev, ...sorted])
                }
                setTotalPages(data.totalPages)
                setPage(data.number)
            })
            .catch(error => console.error(error))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadNewsPage(0)
    }, [])

    const handleCreate = () => {
        navigate('/news/create')
    }

    const handleLoadMore = () => {
        if (page < totalPages - 1)
        {
            loadNewsPage(page + 1)
        }
    }

    return (
        <div className="container news-container">
            <div className="news-header">
                <h2>Latest News</h2>
                {user && user.role >= 2 && (
                    <button className="btn create-btn" onClick={handleCreate}>
                        Create New Post
                    </button>
                )}
            </div>

            {loading && news.length === 0 ? (
                <div className="loading">Loading...</div>
            ) : news.length === 0 ? (
                <p className="empty-state">No news yet.</p>
            ) : (
                <div className="news-feed">
                    {news.map(post => (
                        <NewsFeedItem key={post.id} post={post}/>
                    ))}
                </div>
            )}

            {page < totalPages - 1 && !loading && (
                <button className="btn load-more" onClick={handleLoadMore}>
                    Load More
                </button>
            )}

            {loading && news.length > 0 && (
                <div className="loading">Loading more...</div>
            )}
        </div>
    )
}
