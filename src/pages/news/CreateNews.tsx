import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import NewsForm from '../../components/news/NewsForm'

export default function CreateNews() {
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

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
            formData.append('post', new Blob([JSON.stringify({ title, content })], { type: 'application/json' }))
            if (bannerFile)
            {
                formData.append('banner', bannerFile)
            }
            if (extraFiles)
            {
                extraFiles.forEach((f) => formData.append('extraPhotos', f))
            }

            const res = await fetch('/api/news', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            })

            if (!res.ok)
            {
                const msg = await res.text()
                throw new Error(msg)
            }

            navigate('/news')

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
            <NewsForm
                mode="create"
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
            />
        </div>
    )
}
