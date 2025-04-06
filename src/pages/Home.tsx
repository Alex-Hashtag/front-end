import Hero from '../components/home/Hero'
import Section from '../components/common/Section'
import NewsCard from '../components/home/NewsCard'
import ProductCard from '../components/home/ProductCard'
import {useEffect, useState} from 'react'
import {NewsPost} from '../types/NewsPost'
import {Product} from '../types/Product'
import {Link} from 'react-router-dom'

export default function Home() {
    const [news, setNews] = useState<NewsPost[]>([])
    const [products, setProducts] = useState<Product[]>([])

    useEffect(() => {
        fetch('/api/news?page=0&size=4')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data && data.content)
                {
                    setNews(data.content)
                } else
                {
                    setNews([])
                }
            })
            .catch(() => setNews([]))

        fetch('/api/products?page=0&size=4')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data && data.content)
                {
                    setProducts(data.content)
                } else
                {
                    setProducts([])
                }
            })
            .catch(() => setProducts([]))
    }, [])

    return (
        <>
            <Hero/>

            <main className="container">
                <Section title="Latest News">
                    {news.length > 0 ? (
                        <>
                            <div className="card-grid fade-in sneak-peek">
                                {news.map((post) => (
                                    <NewsCard key={post.id} post={post}/>
                                ))}
                            </div>
                            <div className="section-cta">
                                <Link to="/news">Read full news &raquo;</Link>
                            </div>
                        </>
                    ) : (
                        <p className="empty-state">No news at the moment. Check back soon!</p>
                    )}
                </Section>

                <Section title="Ongoing Fundraisers">
                    {products.length > 0 ? (
                        <>
                            <div className="card-grid fade-in delay sneak-peek">
                                {products.map((p) => (
                                    <ProductCard key={p.id} product={p}/>
                                ))}
                            </div>
                            <div className="section-cta">
                                <Link to="/store">Explore all fundraisers &raquo;</Link>
                            </div>
                        </>
                    ) : (
                        <p className="empty-state">No active items right now — stay tuned!</p>
                    )}
                </Section>
            </main>
        </>
    )
}
