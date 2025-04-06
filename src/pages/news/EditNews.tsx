import {useEffect, useState} from 'react'
import {useLocation, useNavigate, useParams} from 'react-router-dom'
import NewsForm from '../../components/news/NewsForm'

interface NewsData
{
    title: string
    content: string
    bannerPhotoUrl?: string
    extraPhotos?: string
}

export default function EditNews() {
    const location = useLocation()
    const postData = location.state?.post
    const {id} = useParams()
    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [bannerUrl, setBannerUrl] = useState<string | undefined>()
    const [extraUrls, setExtraUrls] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        async function fetchPost()
        {
            if (postData)
            {
                setTitle(postData.title)
                setContent(postData.content)
                setBannerUrl(postData.bannerPhotoUrl || '')
                if (postData.extraPhotos)
                {
                    setExtraUrls(postData.extraPhotos.split(',').map((s: string) => s.trim()))
                }
                setIsReady(true)
                return
            }

            try
            {
                const res = await fetch(`/api/news/${id}`)
                if (!res.ok) throw new Error('Failed to load news post')
                const data: NewsData = await res.json()
                setTitle(data.title)
                setContent(data.content)
                setBannerUrl(data.bannerPhotoUrl || '')
                if (data.extraPhotos)
                {
                    setExtraUrls(data.extraPhotos.split(',').map(s => s.trim()))
                }
                setIsReady(true)
            } catch (err: any)
            {
                setError(err.message)
            }
        }

        if (id)
        {
            fetchPost()
        }
    }, [id, postData])

    async function handleSubmit({
                                    title,
                                    content,
                                    bannerFile,
                                    extraFiles,
                                }: {
        title: string
        content: string
        bannerFile: File | null
        extraFiles: File[] | null
    })
    {
        setLoading(true)
        setError(null)
        try
        {
            const formData = new FormData()
            formData.append('title', title)
            formData.append('content', content)
            if (bannerFile)
            {
                formData.append('banner', bannerFile)
            }
            if (extraFiles)
            {
                extraFiles.forEach(f => {
                    formData.append('extraPhotos', f)
                })
            }

            const res = await fetch(`/api/news/${id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
            })

            if (!res.ok)
            {
                const msg = await res.text()
                throw new Error(msg)
            }
            navigate(`/news/${id}`)
        } catch (err: any)
        {
            setError(err.message)
        } finally
        {
            setLoading(false)
        }
    }


    return (
        <div className="container">
            {error ? (
                <p style={{color: 'red'}}>{error}</p>
            ) : isReady ? (
                <NewsForm
                    mode="edit"
                    initialTitle={title}
                    initialContent={content}
                    initialBannerUrl={bannerUrl}
                    initialExtraUrls={extraUrls}
                    loading={loading}
                    error={error}
                    onSubmit={handleSubmit}
                />
            ) : (
                <p>Loading...</p>
            )}
        </div>
    )
}
