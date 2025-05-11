
import { createContext, useState, useContext, ReactNode } from 'react';
import { Product, Bundle } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
export interface CartItemType {
  product: Product;
  quantity: number;
}
export interface BundleCartItemType {
  bundle: Bundle;
  quantity: number;
}
interface CartContextType {
  cartItems: CartItemType[];
  bundleItems: BundleCartItemType[];
  addToCart: (product: Product, quantity?: number) => void;
  addBundle: (bundle: Bundle, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  removeBundle: (bundleId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  updateBundleQuantity: (bundleId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}
const CartContext = createContext<CartContextType | undefined>(undefined);
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [bundleItems, setBundleItems] = useState<BundleCartItemType[]>([]);
  const { toast } = useToast();
  const addToCart = (product: Product, quantity = 1) => {
    setCartItems(prevItems => {
      // Check if product already exists in cart
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // If it exists, update quantity
        return prevItems.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        // If it doesn't exist, add new item
        return [...prevItems, { product, quantity }];
      }
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };
  const addBundle = (bundle: Bundle, quantity = 1) => {
    setBundleItems(prevItems => {
      // Check if bundle already exists in cart
      const existingItem = prevItems.find(item => item.bundle.id === bundle.id);
      
      if (existingItem) {
        // If it exists, update quantity
        return prevItems.map(item => 
          item.bundle.id === bundle.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        // If it doesn't exist, add new item
        return [...prevItems, { bundle, quantity }];
      }
    });
    toast({
      title: "Added to cart",
      description: `${bundle.name} bundle has been added to your cart.`,
    });
  };
  const removeFromCart = (productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    
    toast({
      title: "Removed from cart",
      description: "The item has been removed from your cart.",
    });
  };
  const removeBundle = (bundleId: number) => {
    setBundleItems(prevItems => prevItems.filter(item => item.bundle.id !== bundleId));
    
    toast({
      title: "Removed from cart",
      description: "The bundle has been removed from your cart.",
    });
  };
  const updateQuantity = (productId: number, quantity: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.product.id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  };
  const updateBundleQuantity = (bundleId: number, quantity: number) => {
    setBundleItems(prevItems => 
      prevItems.map(item => 
        item.bundle.id === bundleId 
          ? { ...item, quantity } 
          : item
      )
    );
  };
  const clearCart = () => {
    setCartItems([]);
    setBundleItems([]);
  };
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0) + 
    bundleItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) +
    bundleItems.reduce((sum, item) => sum + (item.bundle.price * item.quantity), 0);
  return (
    <CartContext.Provider value={{
      cartItems,
      bundleItems,
      addToCart,
      addBundle,
      removeFromCart,
      removeBundle,
      updateQuantity,
      updateBundleQuantity,
      clearCart,
      totalItems,
      subtotal
    }}>
      {children}
    </CartContext.Provider>
  );
};
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};