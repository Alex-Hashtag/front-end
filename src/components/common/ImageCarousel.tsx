import {useState} from 'react'

type ImageCarouselProps = {
    images: string[]
    altPrefix?: string
}

export default function ImageCarousel({images, altPrefix = 'Carousel'}: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    if (images.length === 0) return null

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }

    return (
        <div className="image-carousel">
            <button className="carousel-btn" onClick={handlePrev}>
                &lt;
            </button>
            <img
                src={images[currentIndex]}
                alt={`${altPrefix} ${currentIndex + 1}`}
                className="carousel-image"
            />
            <button className="carousel-btn" onClick={handleNext}>
                &gt;
            </button>
        </div>
    )
}
