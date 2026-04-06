import './About.css'

function About() {
  return (
    <div className="about-container">
      <div className="about-hero">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to ShaliniCart</h1>
          <p className="hero-subtitle">Your Trusted Online Shopping Destination</p>
        </div>
      </div>

      <div className="about-section">
        <div className="about-intro">
          <p>
            Welcome to ShaliniCart, your one-stop destination for quality products at affordable prices. 
            We believe shopping should be simple, enjoyable, and accessible to everyone.
          </p>
        </div>
        
        <div className="about-content">
          <div className="about-text">
            <div className="story-section">
              <h2>🚀 Our Story</h2>
              <p>
                Founded in 2024, ShaliniCart started as a small online store with a big vision - to make quality 
                shopping accessible to everyone. What began as a passion project has grown into a trusted 
                e-commerce platform serving thousands of customers worldwide.
              </p>
              <p>
                We started with a simple mission: provide customers with an unparalleled shopping experience 
                combining quality products, competitive prices, and exceptional service. Today, we continue 
                to innovate and expand our offerings to meet your evolving needs.
              </p>
            </div>
            
            <div className="mission-section">
              <h2>🎯 Our Mission</h2>
              <p>
                We strive to provide our customers with an exceptional shopping experience by offering a wide 
                range of quality products, competitive prices, and excellent customer service. Our goal is to 
                build long-term relationships with our customers based on trust and satisfaction.
              </p>
            </div>
            
            <div className="values-section">
              <h2>💎 Why Choose Us</h2>
              <ul className="about-list">
                <li>Quality products from trusted brands</li>
                <li>Competitive prices with best deals</li>
                <li>Fast and reliable shipping</li>
                <li>Secure payment options</li>
                <li>Excellent 24/7 customer support</li>
                <li>Easy returns and exchanges</li>
                <li>Regular discounts and promotions</li>
                <li>Authentic product guarantees</li>
              </ul>
            </div>
          </div>
          
          <div className="about-image">
            <div className="image-card">
              <div className="image-icon">🛒</div>
              <p>Shopping Made Easy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 className="section-title">Our Special Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Fast Delivery</h3>
            <p>Quick and reliable shipping to your doorstep within 3-5 business days.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Payments</h3>
            <p>Multiple secure payment options including UPI, cards, and COD.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">↩️</div>
            <h3>Easy Returns</h3>
            <p>Hassle-free return policy within 30 days of purchase.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>24/7 Support</h3>
            <p>Round-the-clock customer support to assist you anytime.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏷️</div>
            <h3>Best Prices</h3>
            <p>Competitive pricing with regular discounts and deals.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Quality Guaranteed</h3>
            <p>100% authentic products from verified sellers.</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-number">50K+</span>
            <span className="stat-label">Happy Customers</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">1000+</span>
            <span className="stat-label">Products</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">50+</span>
            <span className="stat-label">Categories</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">4.8</span>
            <span className="stat-label">Rating</span>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <h2>Start Shopping Today!</h2>
        <p>Join thousands of satisfied customers and discover amazing deals on quality products.</p>
        <div className="cta-buttons">
          <a href="/products" className="cta-primary">Browse Products</a>
          <a href="/contact" className="cta-secondary">Contact Us</a>
        </div>
      </div>
    </div>
  )
}

export default About
