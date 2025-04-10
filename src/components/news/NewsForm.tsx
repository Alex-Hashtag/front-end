import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import CommonMarkdownEditor from '../common/CommonMarkdownEditor'

type NewsFormProps = {
    initialTitle?: string
    initialContent?: string
    initialBannerUrl?: string
    initialExtraUrls?: string[]
    loading?: boolean
    error?: string | null
    mode?: 'create' | 'edit'
    onSubmit: (params: {
        title: string
        content: string
        bannerFile: File | null
        extraFiles: File[] | null
        keptExtraUrls: string[]
    }) => void
}

export default function NewsForm({
                                     initialTitle = '',
                                     initialContent = '',
                                     initialBannerUrl,
                                     initialExtraUrls = [],
                                     loading = false,
                                     error,
                                     mode = 'create',
                                     onSubmit,
                                 }: NewsFormProps) {
    const [title, setTitle] = useState(initialTitle)
    const [content, setContent] = useState(initialContent)

    const [bannerFile, setBannerFile] = useState<File | null>(null)
    const [bannerPreview, setBannerPreview] = useState<string | null>(initialBannerUrl || null)

    // This state holds the URLs of the extra photos already stored on the server.
    const [initialExtra, setInitialExtra] = useState<string[]>(initialExtraUrls)
    const [extraFiles, setExtraFiles] = useState<File[]>([])
    const [extraPreviews, setExtraPreviews] = useState<string[]>([])

    useEffect(() => {
        if (bannerFile) {
            const url = URL.createObjectURL(bannerFile)
            setBannerPreview(url)
            return () => URL.revokeObjectURL(url)
        }
    }, [bannerFile])

    const handleBannerChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setBannerFile(e.target.files[0])
        }
    }

    const handleExtraChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            const files = Array.from(e.target.files)
            setExtraFiles(files)
            const previews = files.map(file => URL.createObjectURL(file))
            setExtraPreviews(previews)
        }
    }

    const removeInitialExtra = (idx: number) => {
        setInitialExtra(prev => prev.filter((_, i) => i !== idx))
    }

    const removeExtraPreview = (idx: number) => {
        const urlToRemove = extraPreviews[idx]
        URL.revokeObjectURL(urlToRemove)
        setExtraFiles(prev => prev.filter((_, i) => i !== idx))
        setExtraPreviews(prev => prev.filter((_, i) => i !== idx))
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (!window.confirm('Are you sure you want to save?')) return
        onSubmit({
            title,
            content,
            bannerFile,
            extraFiles: extraFiles.length ? extraFiles : null,
            // Pass along the kept extra URLs from the server (as updated by removals)
            keptExtraUrls: initialExtra,
        })
    }

    return (
        <div className="news-form">
            {error && <div className="form-error">{error}</div>}

            <h2>{mode === 'edit' ? 'Edit News Post' : 'Create News Post'}</h2>

            <form onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3>Basic Information</h3>
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Media</h3>
                    <div className="form-group">
                        <label>Banner Photo</label>
                        <div className="file-input-container">
                            <label className="file-input-label">
                                Choose File
                                <input type="file" accept="image/*" onChange={handleBannerChange} hidden />
                            </label>
                            {bannerFile && <span className="file-name">{bannerFile.name}</span>}
                        </div>
                        {bannerPreview && (
                            <div className="banner-preview">
                                <img src={bannerPreview} alt="Banner" />
                                <button
                                    type="button"
                                    className="preview-remove-btn"
                                    onClick={() => {
                                        setBannerFile(null)
                                        setBannerPreview(null)
                                    }}
                                >
                                    &times;
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Additional Photos</label>
                        <div className="file-input-container">
                            <label className="file-input-label">
                                Choose Files
                                <input type="file" accept="image/*" multiple onChange={handleExtraChange} hidden />
                            </label>
                            {(extraFiles.length > 0 || initialExtra.length > 0) && (
                                <span className="file-name">{extraFiles.length + initialExtra.length} file(s) selected</span>
                            )}
                        </div>

                        <div className="extra-photos-preview">
                            {/* Render images that were already stored on the server */}
                            {initialExtra.map((url, idx) => (
                                <div key={`initial-${idx}`} className="extra-preview-item">
                                    <img src={url} alt={`Extra ${idx + 1}`} />
                                    <button type="button" className="preview-remove-btn" onClick={() => removeInitialExtra(idx)}>
                                        &times;
                                    </button>
                                </div>
                            ))}

                            {/* Render new extra images added by the user */}
                            {extraPreviews.map((url, idx) => (
                                <div key={`extra-${idx}`} className="extra-preview-item">
                                    <img src={url} alt={`Extra ${initialExtra.length + idx + 1}`} />
                                    <button type="button" className="preview-remove-btn" onClick={() => removeExtraPreview(idx)}>
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Content</h3>
                    <div className="form-group">
                        <label>Markdown Content</label>
                        <CommonMarkdownEditor value={content} onChange={(val) => setContent(val || '')} height={400} />
                    </div>
                </div>

                <button type="submit" className="btn" disabled={loading} style={{ marginTop: '1.5rem' }}>
                    {loading ? 'Saving...' : mode === 'edit' ? 'Update Post' : 'Create Post'}
                </button>
            </form>
        </div>
    )
}
