import {Link, useNavigate} from 'react-router-dom'
import {useAuth} from '../../context/AuthContext'
import {useCart} from '../../context/CartContext'
import {Product} from "../../types/Product.ts"
import showdown from 'showdown'
import {useState} from "react"
import {AddToCartDialog} from "../common/AddToCartDialog.tsx"


interface ProductCardProps
{
    product: Product
}

const converter = new showdown.Converter({
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
})

export default function ProductCard({product}: ProductCardProps) {
    const navigate = useNavigate()
    const {user} = useAuth()
    const {addToCart} = useCart()
    const [showCartDialog, setShowCartDialog] = useState(false)

    const stockStatus = product.available === -1
        ? 'Unlimited'
        : product.available > 0
            ? `${product.available} left`
            : 'Out of stock'

    const descriptionHtml = converter.makeHtml(product.description)

    const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        e.stopPropagation()
        try
        {
            addToCart(product, 1)
            setShowCartDialog(true)
        } catch (error)
        {
            console.error("Error adding to cart:", error)
        }
    }

    return (
        <div className="product-card card">
            {product.imageUrl && (
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    onClick={() => navigate(`/store/${product.id}`)}
                    className="product-image"
                />
            )}
            <div className="product-content">
                <h3 className="product-title">{product.name}</h3>
                <p className="product-price">{product.price.toFixed(2)} BGN</p>
                <p className="stock-status">{stockStatus}</p>

                <div
                    className="product-description"
                    dangerouslySetInnerHTML={{__html: descriptionHtml}}
                />

                <div className="product-actions">
                    <button
                        onClick={() => navigate(`/store/${product.id}`)}
                        className="btn"
                    >
                        View Details
                    </button>

                    {user ? (
                        <button
                            onClick={handleAddToCart}
                            className="btn add-to-cart-btn"
                        >
                            Add to Cart
                        </button>
                    ) : (
                        <Link to="/login" className="btn btn-secondary">
                            Login to Add to Cart
                        </Link>
                    )}

                    {user && user?.role >= 2 && (
                        <button
                            onClick={() => navigate(`/store/edit/${product.id}`)}
                            className="btn edit-btn"
                        >
                            Edit
                        </button>
                    )}
                </div>
            </div>
            <AddToCartDialog
                isOpen={showCartDialog}
                onClose={() => setShowCartDialog(false)}
                onContinueShopping={() => navigate('/store')}
                onViewCart={() => navigate('/store/cart')}
            />
        </div>
    )
}
