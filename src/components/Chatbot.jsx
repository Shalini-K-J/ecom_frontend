import { useState, useEffect } from 'react'
import './Chatbot.css'

const predefinedResponses = {
  'hi': 'Hello! Welcome to ShaliniCart. How can I help you today?',
  'hello': 'Hello! Welcome to ShaliniCart. How can I help you today?',
  'hey': 'Hello! Welcome to ShaliniCart. How can I help you today?',
  'help': 'I can help you with:\n- Finding products\n- Order tracking\n- Payment issues\n- Shipping information\n- Returns and refunds\n- Account management',
  'products': 'You can browse our products by visiting the Products page. We have a wide range of categories including electronics, fashion, home goods, and more.',
  'categories': 'Our product categories include:\n- Electronics\n- Fashion\n- Home & Kitchen\n- Sports & Outdoors\n- Beauty\n- Books\n- Toys & Games',
  'order tracking': 'You can track your order by logging into your account and visiting the Order Tracking page.',
  'shipping': 'We offer free shipping on orders over ₹500. Delivery usually takes 3-5 business days.',
  'returns': 'You can return most items within 30 days of purchase for a full refund or exchange.',
  'payment': 'We accept all major credit cards, PayPal, and other secure payment methods.',
  'contact': 'You can contact our customer support team at support@shaliniCart.com or call us at 1-800-123-4567.',
  'admin': 'For admin-related inquiries, please use the Admin Dashboard.',
  'default': 'I understand you have a question. Could you please be more specific about what you need help with?'
}

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')

  useEffect(() => {
    // Welcome message when chatbot opens
    if (isOpen && messages.length === 0) {
      addMessage('bot', 'Hello! Welcome to ShaliniCart. How can I help you today?')
    }
  }, [isOpen, messages.length])

  const addMessage = (type, text) => {
    setMessages(prev => [...prev, { type, text, time: new Date() }])
  }

  const handleSendMessage = () => {
    if (inputText.trim() === '') return

    addMessage('user', inputText.trim())

    // Get bot response
    const lowerCaseText = inputText.toLowerCase()
    let response = predefinedResponses['default']

    for (const keyword in predefinedResponses) {
      if (lowerCaseText.includes(keyword)) {
        response = predefinedResponses[keyword]
        break
      }
    }

    // Simulate bot typing delay
    setTimeout(() => {
      addMessage('bot', response)
    }, 500)

    setInputText('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <button 
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          title="Open Chatbot"
        >
          💬 Chat with us
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-avatar">🤖</div>
            <div className="chatbot-title">
              <h3>ShaliniCart Support</h3>
              <p>We are here to help</p>
            </div>
            <button 
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              title="Close Chat"
            >
              ×
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                <div className="message-content">
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
                <div className="message-time">
                  {msg.time.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="chatbot-input-field"
            />
            <button 
              onClick={handleSendMessage}
              className="chatbot-send"
              title="Send Message"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chatbot
