// src/pages/store/ProductDetail.tsx
import {useEffect, useRef, useState} from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'
import {useAuth} from '../../context/AuthContext'
import {useCart} from '../../context/CartContext'
import {Product} from "../../types/Product.ts"
import {marked} from 'marked'
import {AddToCartDialog} from "../../components/common/AddToCartDialog.tsx"

export default function ProductDetail() {
    const {id} = useParams()
    const [product, setProduct] = useState<Product | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [showCartDialog, setShowCartDialog] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const {addToCart} = useCart()
    const {user} = useAuth()
    const navigate = useNavigate()
    const lastFetchedId = useRef<string | null>(null)

    useEffect(() => {
        if (lastFetchedId.current !== id)
        {
            fetch(`/api/products/${id}`)
                .then(res => res.json())
                .then(data => {
                    setProduct(data)
                    lastFetchedId.current = id ?? null
                })
        }
    }, [id])

    const handleAddToCart = () => {
        if (!product) return
        try
        {
            addToCart(product, quantity)
            setShowCartDialog(true)
        } catch (error)
        {
            console.error("Error adding to cart:", error)
        }
    }

    const handleDeleteProduct = async () => {
        if (!product || !user) return

        setIsDeleting(true)
        try
        {
            const response = await fetch(`/api/products/${product.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (!response.ok)
            {
                throw new Error('Failed to delete product')
            }

            navigate('/store', {replace: true})
        } catch (error)
        {
            console.error('Delete error:', error)
        } finally
        {
            setIsDeleting(false)
        }
    }

    const renderMarkdown = (content: string) => {
        return {__html: marked.parse(content)}
    }

    if (!product) return <div className="container">Loading...</div>

    return (
        <div className="container product-detail">
            <div className="product-detail-grid">
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="product-detail-image"
                />

                <div className="product-detail-info">
                    <h1 className="product-detail-title">{product.name}</h1>
                    <p className="product-detail-price">${product.price.toFixed(2)}</p>

                    <article
                        className="product-detail-description"
                        dangerouslySetInnerHTML={renderMarkdown(product.description)}
                    />

                    <div className="quantity-selector">
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={e => setQuantity(Math.max(1, parseInt(e.target.value)))}
                            className="quantity-input"
                        />

                        {user ? (
                            <button
                                onClick={handleAddToCart}
                                className="btn add-to-cart-btn"
                            >
                                Add to Cart
                            </button>
                        ) : (
                            // Optionally, you could show a link to login here:
                            <Link to="/login" className="btn btn-secondary">
                                Login to Add to Cart
                            </Link>
                        )}
                    </div>

                    {user && user?.role >= 2 && (
                        <div className="admin-actions">
                            <button
                                onClick={() => navigate(`/store/edit/${product.id}`)}
                                className="btn edit-btn"
                            >
                                Edit Product
                            </button>
                            <button
                                onClick={handleDeleteProduct}
                                className="btn delete-btn"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Product'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add to Cart Confirmation Dialog */}
            <AddToCartDialog
                isOpen={showCartDialog}
                onClose={() => setShowCartDialog(false)}
                onContinueShopping={() => navigate('/store')}
                onViewCart={() => navigate('/store/cart')}
            />
        </div>
    )
}
