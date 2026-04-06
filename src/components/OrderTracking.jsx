import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './OrderTracking.css'
import { showToast } from './Toast'

function OrderTracking() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    // Load orders from localStorage
    const loadOrders = () => {
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]')
      setOrders(savedOrders.reverse()) // Show newest first
    }
    
    loadOrders()
    
    // Poll for real-time updates every 3 seconds
    const interval = setInterval(() => {
      loadOrders()
    }, 3000)
    
    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [])


  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return '#3498db'
      case 'Shipped': return '#f39c12'
      case 'Delivered': return '#27ae60'
      default: return '#666'
    }
  }

  // Generate and download invoice
  const downloadInvoice = (order) => {
    const invoiceContent = `
INVOICE
================================================================================
SHALINICART
E-Commerce Store

Order ID: ${order.id}
Date: ${new Date(order.date).toLocaleDateString()}
Status: ${order.status}

--------------------------------------------------------------------------------
BILL TO:
${order.address?.name || 'Customer'}
${order.address?.address || ''}
${order.address?.city || ''}, ${order.address?.state || ''} ${order.address?.pincode || ''}
Phone: ${order.address?.phone || 'N/A'}
Email: ${order.userEmail}

--------------------------------------------------------------------------------
ITEMS:
${order.items?.map(item => `
${item.name}
  Qty: ${item.quantity || 1} x ${item.price} = ${((item.quantity || 1) * item.price).toFixed(2)}
`).join('')}

--------------------------------------------------------------------------------
Subtotal:   ${order.subtotal}
GST (18%):  ${order.gst}
TOTAL:      ${order.total}

--------------------------------------------------------------------------------
Payment Method: ${order.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}
${order.upiId ? `UPI ID: ${order.upiId}` : ''}

================================================================================
Thank you for shopping with ShaliniCart!
================================================================================
    `.trim()

    // Create blob and download
    const blob = new Blob([invoiceContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice_${order.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('Invoice downloaded!', 'success')
  }

  if (orders.length === 0) {
    return (
      <div className="tracking-page">
        <div className="tracking-container">
          <h1>Order Tracking</h1>
          <p className="no-orders">No orders found</p>
          <Link to="/products" className="shop-now-btn">Shop Now</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="tracking-page">
      <div className="tracking-container">
        <h1>Order Tracking</h1>
        
        <div className="orders-list">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
              onClick={() => setSelectedOrder(order)}
            >
              <div className="order-header">
                <span className="order-id">{order.id}</span>
                <span 
                  className="order-status" 
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status}
                </span>
              </div>
              <div className="order-details">
                <span className="order-date">
                  {new Date(order.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="order-total">₹{order.total}</span>
              </div>
            </div>
          ))}
        </div>

        {selectedOrder && (
          <div className="order-details-panel">
            <h2>Order Details</h2>
            <div className="detail-section">
              <h3>Order ID: {selectedOrder.id}</h3>
              <p><strong>Date:</strong> {new Date(selectedOrder.date).toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}</p>
              {selectedOrder.upiId && <p><strong>UPI ID:</strong> {selectedOrder.upiId}</p>}
              <p><strong>Status:</strong> <span style={{ color: getStatusColor(selectedOrder.status) }}>{selectedOrder.status}</span></p>
              <button 
                className="download-invoice-btn"
                onClick={() => downloadInvoice(selectedOrder)}
              >
                📥 Download Invoice
              </button>
            </div>

            <div className="detail-section">
              <h3>Items</h3>
              {selectedOrder.items.map((item, index) => (
                <div key={index} className="item-row">
                  <span>{item.image.startsWith('http') ? <img src={item.image} alt="" className="item-thumb" /> : item.image} {item.name}</span>
                  <span>₹{item.price}</span>
                </div>
              ))}
            </div>

            <div className="detail-section">
              <div className="price-breakdown-row">
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal}</span>
              </div>
              <div className="price-breakdown-row">
                <span>GST</span>
                <span>₹{selectedOrder.gst}</span>
              </div>
              <div className="price-breakdown-row total">
                <span>Total</span>
                <span>₹{selectedOrder.total}</span>
              </div>
            </div>

            <div className="tracking-timeline">
              <h3>Tracking</h3>
              <div className="timeline">
                <div className={`timeline-step ${selectedOrder.status !== 'Pending' ? 'completed' : ''}`}>
                  <div className="step-dot"></div>
                  <span>Order Placed</span>
                </div>
                <div className={`timeline-step ${selectedOrder.status === 'Shipped' || selectedOrder.status === 'Delivered' ? 'completed' : ''}`}>
                  <div className="step-dot"></div>
                  <span>Processing</span>
                </div>
                <div className={`timeline-step ${selectedOrder.status === 'Delivered' ? 'completed' : ''}`}>
                  <div className="step-dot"></div>
                  <span>Delivered</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderTracking
