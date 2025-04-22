/**
 * Animations utility for the ACS Student Council Website
 * This file contains animation helpers for sections, cards, and other interactive elements
 */

/**
 * Initializes section scroll animations using IntersectionObserver
 * Elements with class 'section' will animate in when scrolled into view
 */
export const initSectionAnimations = () => {
    // Add the fade-in class initially to all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.add('fade-in');
    });
    
    // Create IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // When section is in view, remove fade-in class to trigger animation
                entry.target.classList.remove('fade-in');
                // Stop observing after animation
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px 0px -100px 0px', // Trigger slightly before the section comes into view
        threshold: 0.1
    });
    
    // Observe all sections
    sections.forEach(section => {
        observer.observe(section);
    });
};

/**
 * Initializes card hover animations 
 * Applies hover effects to cards, news cards, and product cards
 */
export const initCardAnimations = () => {
    const cards = document.querySelectorAll('.card, .news-card, .product-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('animate-scale');
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('animate-scale');
        });
    });
};

/**
 * Adds staggered animation to a list of elements
 * @param {string} selector - CSS selector for the elements
 * @param {string} animationClass - CSS animation class to apply
 * @param {number} delay - Delay in ms between each element animation
 */
export const staggeredAnimation = (selector, animationClass, delay = 100) => {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add(animationClass);
        }, index * delay);
    });
};

/**
 * Initialize all animations
 */
export const initAllAnimations = () => {
    initSectionAnimations();
    initCardAnimations();
    
    // Add staggered animations for nav items
    staggeredAnimation('.nav-link', 'animate-fade-in', 100);
    
    // Add fade-up animation to cards with a staggered delay
    staggeredAnimation('.card', 'animate-fade-up', 150);
};
