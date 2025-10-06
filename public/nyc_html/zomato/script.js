// Facebook Pixel Configuration
const FACEBOOK_PIXEL_ID = '697872796642213'; // actual Facebook Pixel ID
const ZOMATO_URL = 'https://link.zomato.com/xqzv/rshare?id=11572794130563eb5'; // actual Zomato link

// Initialize Facebook Pixel
function initializeFacebookPixel() {
    // Check if Facebook Pixel is already loaded
    if (typeof window.fbq !== 'undefined') {
        return;
    }

    // Facebook Pixel Code
    !function(f,b,e,v,n,t,s) {
        if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)
    }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
    
    // Initialize with your Pixel ID
    window.fbq('init', FACEBOOK_PIXEL_ID);
    window.fbq('track', 'PageView');

    // Add noscript fallback
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `
        <img height="1" width="1" style="display:none" 
             src="https://www.facebook.com/tr?id=${FACEBOOK_PIXEL_ID}&ev=PageView&noscript=1"/>
    `;
    document.head.appendChild(noscript);
}

// Track Facebook conversion
function trackConversion(eventName = 'Lead', params = {}) {
    if (typeof window.fbq !== 'undefined') {
        window.fbq('track', eventName, {
            content_name: 'Order Now CTA',
            content_category: 'Food Delivery',
            value: 0.00,
            currency: 'INR',
            source: 'landing_page',
            ...params
        });
    }
}

// Track engagement
function trackEngagement(action, details = {}) {
    if (typeof window.fbq !== 'undefined') {
        window.fbq('track', 'ViewContent', {
            content_type: action,
            ...details
        });
    }
}

// // Handle CTA click with tracking and redirect commented and replaced by following function using chatGPT 
// function handleCTAClick() {
//     // Show loading state
//     showLoadingState();
    
    
    
//     // Track the conversion as a custom event
// if (typeof window.fbq !== 'undefined') {
//     window.fbq('trackCustom', 'OrderNowClick', {
//         content_name: 'Order Now CTA',
//         content_category: 'Food Delivery',
//         source: 'landing_page'
//     });
// }
    
//     // Add slight delay for tracking to register, then redirect
//     setTimeout(() => {
//         window.location.href = ZOMATO_URL;
//     }, 300);
// }

function handleCTAClick() {
    // Show loading state
    showLoadingState();
    
    // Track the conversion as a Purchase event
    if (typeof window.fbq !== 'undefined') {
        window.fbq('track', 'Purchase', {
            content_name: 'Order Now CTA',
            content_category: 'Food Delivery',
            value: 0.00, // you can pass burger price here if you want
            currency: 'INR',
            source: 'landing_page'
        });
    }
    
    // (Optional) Still fire your custom event for reporting
    if (typeof window.fbq !== 'undefined') {
        window.fbq('trackCustom', 'OrderNowClick', {
            content_name: 'Order Now CTA',
            content_category: 'Food Delivery',
            source: 'landing_page'
        });
    }
    
    // Add slight delay for tracking to register, then redirect
    setTimeout(() => {
        window.location.href = ZOMATO_URL;
    }, 300);
}



// Show loading state for buttons
function showLoadingState() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const mainCTA = document.getElementById('main-cta');
    const btnText = mainCTA.querySelector('.btn-text');
    const btnLoading = mainCTA.querySelector('.btn-loading');
    
    // Show overlay
    loadingOverlay.style.display = 'flex';
    
    // Update main button
    mainCTA.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';
}

// Scroll tracking for engagement
let scrollTracked = false;
function handleScroll() {
    if (!scrollTracked && window.scrollY > 100) {
        scrollTracked = true;
        trackEngagement('page_scroll', {
            content_ids: ['landing_page_engagement']
        });
    }
}

// Page engagement time tracking
let pageStartTime = Date.now();
function trackPageEngagementTime() {
    const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
    if (timeSpent > 5) {
        trackEngagement('engagement_time', {
            value: timeSpent,
            currency: 'seconds'
        });
    }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Facebook Pixel
    initializeFacebookPixel();
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Track engagement time when user leaves page
    window.addEventListener('beforeunload', trackPageEngagementTime);
    
    // Add click event listeners to all CTA buttons
    const ctaButtons = document.querySelectorAll('[data-testid^="button-order"], [data-testid^="button-floating"]');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            handleCTAClick();
        });
    });
    
    // Add hover tracking for engagement
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.addEventListener('mouseenter', function() {
            trackEngagement('title_hover');
        });
    }
    
    // Track popular item clicks
    const popularItems = document.querySelectorAll('[data-testid^="item-"]');
    popularItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            trackEngagement('popular_item_click', {
                content_ids: [`item_${index + 1}`]
            });
        });
    });
});

// Track visibility changes for engagement
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
        trackPageEngagementTime();
    } else if (document.visibilityState === 'visible') {
        pageStartTime = Date.now(); // Reset timer when page becomes visible again
    }
});

// Track page focus/blur for engagement
window.addEventListener('blur', trackPageEngagementTime);
window.addEventListener('focus', function() {
    pageStartTime = Date.now();
});

// Mobile-specific optimizations
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // Track mobile-specific events
    document.addEventListener('touchstart', function() {
        trackEngagement('mobile_touch');
    }, { once: true });
    
    // Optimize touch interactions
    document.addEventListener('touchend', function(e) {
        // Add slight delay to prevent accidental double-taps
        if (e.target.classList.contains('btn')) {
            e.preventDefault();
            setTimeout(() => {
                e.target.click();
            }, 100);
        }
    });
}

// Performance tracking
window.addEventListener('load', function() {
    // Track page load time
    const loadTime = performance.now();
    trackEngagement('page_load_time', {
        value: Math.round(loadTime),
        currency: 'milliseconds'
    });
});

// Error tracking
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    trackEngagement('javascript_error', {
        content_type: 'error',
        value: e.filename + ':' + e.lineno
    });
});

// Console messages for debugging (remove in production)
console.log('NYC Burgers Landing Page Loaded');
console.log('Facebook Pixel ID:', FACEBOOK_PIXEL_ID);
console.log('Zomato URL:', ZOMATO_URL);
console.log('Remember to replace FACEBOOK_PIXEL_ID and ZOMATO_URL with actual values!');