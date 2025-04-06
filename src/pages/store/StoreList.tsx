import {useEffect, useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth} from '../../context/AuthContext'
import ProductCard from '../../components/store/ProductCard'
import {Product} from "../../types/Product.ts"
import {PaginatedProducts} from "../../types/PaginatedProducts.ts"

export default function StoreList() {
    const [products, setProducts] = useState<Product[]>([])
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(true)
    const {user} = useAuth()
    const navigate = useNavigate()

    const initialLoadDone = useRef(false)

    const loadProducts = (pageNumber: number) => {
        setLoading(true)
        fetch(`/api/products?page=${pageNumber}&size=10`)
            .then(res => res.json())
            .then((data: PaginatedProducts) => {
                if (pageNumber === 0)
                {
                    setProducts(data.content)
                } else
                {
                    setProducts(prev => [...prev, ...data.content])
                }
                setTotalPages(data.totalPages)
                setPage(data.number)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        if (!initialLoadDone.current)
        {
            loadProducts(0)
            initialLoadDone.current = true
        }
    }, [])

    return (
        <div className="container store-container">
            <div className="store-header">
                <h2>Fundraiser Products</h2>
                {user && user?.role >= 2 && (
                    <button
                        onClick={() => navigate('/store/create')}
                        className="btn create-btn"
                    >
                        Create Product
                    </button>
                )}
            </div>

            {loading && products.length === 0 ? (
                <div className="loading">Loading...</div>
            ) : products.length === 0 ? (
                <p className="empty-state">No products found.</p>
            ) : (
                <div className="product-grid">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product}/>
                    ))}
                </div>
            )}

            {page < totalPages - 1 && !loading && (
                <button
                    onClick={() => loadProducts(page + 1)}
                    className="btn load-more"
                >
                    Load More
                </button>
            )}

            {loading && products.length > 0 && (
                <div className="loading">Loading more...</div>
            )}
        </div>
    )
}
