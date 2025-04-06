import {useEffect, useState} from 'react'
import {Product} from "../../types/Product.ts"
import CommonMarkdownEditor from '../common/CommonMarkdownEditor' // <-- NEW IMPORT

interface ProductFormProps
{
    initialData?: Product
    onSubmit: (formData: FormData) => void
    loading: boolean
    error: string | null
    mode: 'create' | 'edit'
}

export default function ProductForm({
                                        initialData,
                                        onSubmit,
                                        loading,
                                        error,
                                        mode
                                    }: ProductFormProps)
{
    const [name, setName] = useState(initialData?.name || '')
    const [description, setDescription] = useState(initialData?.description || '')
    const [price, setPrice] = useState(initialData?.price || 0)
    const [available, setAvailable] = useState(initialData?.available || -1)
    const [image, setImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null)

    useEffect(() => {
        if (image)
        {
            const url = URL.createObjectURL(image)
            setImagePreview(url)
            return () => URL.revokeObjectURL(url)
        }
    }, [image])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0])
        {
            setImage(e.target.files[0])
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('name', name)
        formData.append('description', description)
        formData.append('price', price.toString())
        formData.append('available', available.toString())
        if (image)
        {
            formData.append('file', image)
        }
        onSubmit(formData)
    }

    return (
        <div className="product-form">
            {error && <div className="form-error">{error}</div>}

            <h2>{mode === 'edit' ? 'Edit Product' : 'Create Product'}</h2>

            <form onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3>Basic Information</h3>
                    <div className="form-group">
                        <label>Product Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <CommonMarkdownEditor
                            value={description}
                            onChange={(val) => setDescription(val || '')}
                            height={300}
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Pricing & Inventory</h3>
                    <div className="form-inline">
                        <div className="form-group">
                            <label>Price</label>
                            <input
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(parseFloat(e.target.value))}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                Stock
                                <span
                                    className="tooltip"
                                    data-tooltip="-1 means infinite stock (until removed)"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="16" x2="12" y2="12"></line>
                                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                    </svg>
                                </span>
                            </label>
                            <input
                                type="number"
                                value={available}
                                onChange={(e) => setAvailable(parseInt(e.target.value, 10))}
                                min="-1"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Product Image</h3>
                    <div className="form-group">
                        <div className="file-input-container">
                            <label className="file-input-label">
                                Choose File
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    hidden
                                />
                            </label>
                            {image && <span className="file-name">{image.name}</span>}
                        </div>
                        {imagePreview && (
                            <div className="image-preview">
                                <img src={imagePreview} alt="Product"/>
                                <button
                                    type="button"
                                    className="preview-remove-btn"
                                    onClick={() => {
                                        setImage(null)
                                        setImagePreview(null)
                                    }}
                                >
                                    &times;
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn"
                    disabled={loading}
                    style={{marginTop: '1.5rem'}}
                >
                    {loading ? 'Processing...' : mode === 'create' ? 'Create Product' : 'Update Product'}
                </button>
            </form>

        </div>
    )
}
