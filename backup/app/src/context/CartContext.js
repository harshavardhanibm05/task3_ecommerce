import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const fetchCartItems = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cart/items');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
    }
  }, []);

  const addToCart = useCallback(async ({ product_id, source, product_name, product_price }) => {
    const response = await fetch('http://localhost:5000/api/add/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id, source, product_name, product_price })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to add to cart');
    }
    // Refresh cart count after successful add
    await fetchCartItems();
    return data;
  }, [fetchCartItems]);

  const removeFromCart = useCallback(async (cartItemId) => {
    const response = await fetch(`http://localhost:5000/api/cart/items/${cartItemId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to remove from cart');
    }
    // Refresh cart after removal
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
