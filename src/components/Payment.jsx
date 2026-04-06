import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCreditCard, FaMobileAlt, FaMoneyBillWave } from 'react-icons/fa'
import { orderAPI } from '../services/api'
import './Payment.css'
import { showToast } from './Toast'

function Payment() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [subtotal, setSubtotal] = useState(0)
  const [totalGST, setTotalGST] = useState(0)
  const [total, setTotal] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [upiId, setUpiId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderAddress, setOrderAddress] = useState(null)

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartItems(savedCart)
    
    // Get address
    const address = JSON.parse(localStorage.getItem('orderAddress') || 'null')
    setOrderAddress(address)
    
    // Calculate totals with GST
    let sub = 0
    let gst = 0
    let totalAmount = 0
    
    savedCart.forEach(item => {
      const basePrice = parseFloat(item.price)
      const profitPercent = parseFloat(item.profit || 0)
      const gstPercent = parseFloat(item.gst || 0)
      
      // Selling price = base price + profit
      const sellingPrice = basePrice + (basePrice * profitPercent / 100)
      // Price with GST
      const priceWithGST = sellingPrice + (sellingPrice * gstPercent / 100)
      
      sub += basePrice
      gst += (priceWithGST - sellingPrice)
      totalAmount += priceWithGST
    })
    
    setSubtotal(sub.toFixed(2))
    setTotalGST(gst.toFixed(2))
    setTotal(totalAmount.toFixed(2))
  }, [])

  // Razorpay payment handler
  const handleRazorpayPayment = async () => {
    if (!paymentMethod) {
      showToast('Please select a payment method', 'error')
      return
    }

    setIsProcessing(true)

    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      showToast('Payment gateway loading... Please try again', 'error')
      setIsProcessing(false)
      return
    }

    // For demo purposes, we use a test key
    // In production, replace with your actual Razorpay key_id
    const razorpayKeyId = 'rzp_test_1Demo5ifzl6'

    const options = {
      key: razorpayKeyId,
      amount: Math.round(parseFloat(total) * 100), // Amount in paise
      currency: 'INR',
      name: 'Shalini Cart',
      description: 'Order Payment',
      handler: function(response) {
        // Payment successful
        showToast('Payment successful! Processing your order...', 'success')
        processOrder(response.razorpay_payment_id)
      },
      prefill: {
        name: orderAddress?.name || '',
        email: JSON.parse(localStorage.getItem('userData') || '{}').email || '',
        contact: orderAddress?.phone || ''
      },
      theme: {
        color: '#667eea'
      },
      modal: {
        ondismiss: function() {
          setIsProcessing(false)
          showToast('Payment cancelled by user', 'info')
        }
      }
    }

    try {
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function(response) {
        console.error('Payment failed:', response.error)
        setIsProcessing(false)
        showToast(`Payment failed: ${response.error.description}`, 'error')
      })
      rzp.open()
    } catch (error) {
      console.error('Razorpay error:', error)
      setIsProcessing(false)
      showToast('Unable to initialize payment. Please try again.', 'error')
    }
  }

  // Process order after successful payment
  const processOrder = async (paymentId = null) => {
    // Create order with price details
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    const order = {
      id: 'ORD-' + Date.now(),
      items: cartItems,
      subtotal: subtotal,
      gst: totalGST,
      total: total,
      paymentMethod: paymentMethod,
      paymentId: paymentId,
      upiId: paymentMethod === 'upi' ? upiId : null,
      date: new Date().toISOString(),
      status: 'Processing',
      address: orderAddress,
      userEmail: userData.email || 'guest@example.com'
    }

    // Save order to backend database
    try {
      if (userData.id) {
        await orderAPI.createOrder(userData.id, {
          items: cartItems,
          totalAmount: total,
          shippingAddress: orderAddress,
          paymentMethod: paymentMethod || 'COD'
        })
      }
    } catch (error) {
      console.error('Error saving order to backend:', error)
    }

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    orders.push(order)
    localStorage.setItem('orders', JSON.stringify(orders))

    // Clear cart and address
    localStorage.setItem('cart', JSON.stringify([]))
    localStorage.setItem('orderAddress', JSON.stringify(null))

    setIsProcessing(false)
    showToast('Payment successful! Your order has been placed.', 'success')
    navigate('/order-tracking')
  }

  const handlePayment = (e) => {
    e.preventDefault()
    
    if (!paymentMethod) {
      showToast('Please select a payment method', 'error')
      return
    }

    if (paymentMethod === 'upi' && !upiId) {
      showToast('Please enter your UPI ID', 'error')
      return
    }

    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment()
      return
    }

    setIsProcessing(true)

    // Simulate payment processing for COD
    setTimeout(() => {
      processOrder()
    }, 2000)
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1>Checkout</h1>
        
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-items">
            {cartItems.map((item, index) => {
              const basePrice = parseFloat(item.price)
              const profitPercent = parseFloat(item.profit || 0)
              const gstPercent = parseFloat(item.gst || 0)
              const sellingPrice = basePrice + (basePrice * profitPercent / 100)
              const priceWithGST = sellingPrice + (sellingPrice * gstPercent / 100)
              
              return (
                <div key={index} className="summary-item">
                  <div className="item-info">
                    <span>{item.name}</span>
                    <span className="item-base-price">Base: ₹{basePrice}</span>
                  </div>
                  <span>₹{priceWithGST.toFixed(2)}</span>
                </div>
              )
            })}
          </div>
          
          <div className="price-breakdown">
            <div className="summary-row">
              <span>Subtotal (Base Price)</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="summary-row">
              <span>GST (Includes {cartItems.map(i => i.gst || 0).join('% + ')}%)</span>
              <span>₹{totalGST}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>

        <form className="payment-form" onSubmit={handlePayment}>
          <h2>Select Payment Method</h2>
          
          <div className="payment-options">
            <label className={`payment-option ${paymentMethod === 'razorpay' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="payment"
                value="razorpay"
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="option-content">
                <span className="option-icon"><FaCreditCard /></span>
                <span className="option-title">Card / UPI / Net Banking</span>
                <span className="option-desc">Pay securely with Razorpay</span>
              </div>
            </label>

            <label className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="payment"
                value="upi"
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="option-content">
                <span className="option-icon"><FaMobileAlt /></span>
                <span className="option-title">UPI</span>
                <span className="option-desc">Pay via Google Pay, PhonePe, Paytm</span>
              </div>
            </label>

            <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="payment"
                value="cod"
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="option-content">
                <span className="option-icon"><FaMoneyBillWave /></span>
                <span className="option-title">Cash on Delivery</span>
                <span className="option-desc">Pay when you receive</span>
              </div>
            </label>
          </div>

          {paymentMethod === 'upi' && (
            <div className="upi-form">
              <label>Enter UPI ID</label>
              <input
                type="text"
                placeholder="example@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            </div>
          )}

          <button type="submit" className="pay-btn" disabled={isProcessing}>
            {isProcessing ? 'Processing...' : `Pay ₹${total}`}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Payment
