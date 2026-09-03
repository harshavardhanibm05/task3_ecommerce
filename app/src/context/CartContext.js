import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Helper function to get token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    } : {
      'Content-Type': 'application/json'
    };
  };

  const fetchCartItems = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    // If no user is logged in, empty the cart and stop fetching
    if (!token) {
      setCartItems([]);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/cart/items', {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
    }
  }, []);

  const addToCart = useCallback(async ({ product_id, source, product_name, product_price }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('LOGIN_REQUIRED');
    }
    const response = await fetch('http://localhost:5000/api/add/cart', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_id, source, product_name, product_price })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to add to cart');
    }
    await fetchCartItems();
    return data;
  }, [fetchCartItems]);

  const removeFromCart = useCallback(async (cartItemId) => {
    const response = await fetch(`http://localhost:5000/api/cart/items/${cartItemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to remove from cart');
    }
    await fetchCartItems();
    return data;
  }, [fetchCartItems]);

  return (
    <CartContext.Provider value={{ cartItems, fetchCartItems, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}