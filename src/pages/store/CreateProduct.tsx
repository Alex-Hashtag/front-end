import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import ProductForm from '../../components/store/ProductForm'

export default function CreateProduct() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        try
        {
            // Build product object from FormData fields
            const productData = {
                name: formData.get('name'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price') as string),
                available: parseInt(formData.get('available') as string),
                // The createdBy field will be set in the controller using the authenticated user
            }

            // Send the product data as JSON
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(productData)
            })

            if (!response.ok)
            {
                throw new Error('Failed to create product')
            }

            const product = await response.json()

            const file = formData.get('file')
            if (file && file instanceof File)
            {
                const fileFormData = new FormData()
                fileFormData.append('file', file)
                const uploadResponse = await fetch(`/api/products/${product.id}/upload-image`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    body: fileFormData
                })

                if (!uploadResponse.ok)
                {
                    throw new Error('Failed to upload product image')
                }

                const updatedProduct = await uploadResponse.json()
                navigate(`/store/${updatedProduct.id}`)
            } else
            {
                navigate(`/store/${product.id}`)
            }
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
            <ProductForm
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
                mode="create"
            />
        </div>
    )
}
