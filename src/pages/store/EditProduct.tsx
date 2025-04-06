import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import ProductForm from '../../components/store/ProductForm'
import {Product} from "../../types/Product.ts"

export default function EditProduct() {
    const {id} = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchProduct = async () => {
            try
            {
                const response = await fetch(`/api/products/${id}`)
                if (!response.ok) throw new Error('Product not found')
                const data = await response.json()
                setProduct(data)
            } catch (err: any)
            {
                setError(err.message)
            } finally
            {
                setLoading(false)
            }
        }
        fetchProduct()
    }, [id])

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        try
        {
            const updatedProduct: { [key: string]: any } = {}
            formData.forEach((value, key) => {
                if (key !== 'file')
                { // Skip the file field
                    updatedProduct[key] = value
                }
            })

            const multipartData = new FormData()
            multipartData.append('product', JSON.stringify(updatedProduct))

            const file = formData.get('file')
            if (file && file instanceof File)
            {
                multipartData.append('file', file)
            }

            const updateResponse = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: multipartData
            })

            if (!updateResponse.ok)
            {
                throw new Error('Failed to update product')
            }

            navigate(`/store/${id}`)
        } catch (err: any)
        {
            setError(err.message)
        } finally
        {
            setLoading(false)
        }
    }

    if (loading) return <div className="container">Loading...</div>
    if (error) return <div className="container">{error}</div>
    if (!product) return <div className="container">Product not found</div>

    return (
        <div className="container">
            <ProductForm
                initialData={product}
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
                mode="edit"
            />
        </div>
    )
}
