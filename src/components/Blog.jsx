import './Blog.css'

const blogPosts = [
  {
    id: 1,
    title: '10 Tips for Smart Online Shopping',
    excerpt: 'Learn how to shop smartly online and save money while getting quality products.',
    author: 'Shalini Sharma',
    date: 'January 15, 2024',
    category: 'Shopping Tips',
    image: '🛍️'
  },
  {
    id: 2,
    title: 'The Future of E-Commerce',
    excerpt: 'Explore the latest trends and technologies shaping the future of online shopping.',
    author: 'Rahul Patel',
    date: 'February 10, 2024',
    category: 'Technology',
    image: '🚀'
  },
  {
    id: 3,
    title: 'Top 5 Productivity Hacks',
    excerpt: 'Discover simple yet effective productivity hacks to make the most of your time.',
    author: 'Priya Singh',
    date: 'March 5, 2024',
    category: 'Productivity',
    image: '💡'
  },
  {
    id: 4,
    title: 'Healthy Living on a Budget',
    excerpt: 'Learn how to maintain a healthy lifestyle without breaking the bank.',
    author: 'Anita Desai',
    date: 'April 12, 2024',
    category: 'Health',
    image: '🥗'
  }
]

function Blog() {
  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1 className="blog-title">Our Blog</h1>
        <p className="blog-subtitle">Stay updated with the latest trends and tips</p>
      </div>
      
      <div className="blog-grid">
        {blogPosts.map(post => (
          <div key={post.id} className="blog-card">
            <div className="blog-image">
              <span className="blog-emoji">{post.image}</span>
            </div>
            <div className="blog-content">
              <div className="blog-meta">
                <span className="blog-category">{post.category}</span>
                <span className="blog-date">{post.date}</span>
              </div>
              <h2 className="blog-post-title">{post.title}</h2>
              <p className="blog-excerpt">{post.excerpt}</p>
              <div className="blog-author">
                <span className="author-label">By</span>
                <span className="author-name">{post.author}</span>
              </div>
              <button className="read-more">Read More</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Blog