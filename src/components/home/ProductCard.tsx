import {Product} from '../../types/Product'
import {Link} from 'react-router-dom'

interface Props
{
    product: Product
}

export default function ProductCard({product}: Props) {
    return (
        <Link to={`/store/${product.id}`} className="card">
            <img src={product.imageUrl} alt={product.name} className="card-img"/>
            <div className="card-body">
                <h3 className="card-title">{product.name}</h3>
                <p className="card-desc">{product.description}</p>
                <p className="card-price">${product.price.toFixed(2)}</p>
            </div>
        </Link>
    )
}
