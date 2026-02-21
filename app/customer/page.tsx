'use client';

import { useState, useEffect } from 'react';
import CustomerLayout from '@/components/CustomerLayout';
import { ShoppingCartIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  unit: string;
  image?: string;
  stockLevel: number;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export default function CustomerProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [message, setMessage] = useState({ show: false, text: '', product: '' });

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (message.show) {
      const timer = setTimeout(() => {
        setMessage({ ...message, show: false });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message.show]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
      
      const uniqueCategories = [...new Set(data.map((p: Product) => p.category))];
      setCategories(uniqueCategories as string[]);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product._id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [
        ...prevCart,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          unit: product.unit,
        },
      ];
    });

    setMessage({
      show: true,
      text: `${product.name} added to cart`,
      product: product._id
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const handleCheckout = () => {
    setShowCart(false);
    router.push('/customer/checkout');
  };

  return (
    <CustomerLayout>
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <ShoppingCartIcon className="h-5 w-5 mr-2" />
            Cart ({cart.length})
          </button>
        </div>

        {message.show && (
          <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            {message.text}
          </div>
        )}

        <div className="mb-6">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-500">{product.category}</span>
                    <span className="text-sm font-medium text-gray-700">
                      Stock: {product.stockLevel} units | {product.unit}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stockLevel === 0}
                      className={`px-3 py-1 rounded cursor-pointer ${
                        product.stockLevel > 0
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {product.stockLevel > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCart && (
          <div className="fixed inset-0 overflow-hidden z-50">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCart(false)} />
              
              <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
                <div className="w-screen max-w-md">
                  <div className="h-full flex flex-col bg-white shadow-xl">
                    <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                        <button
                          onClick={() => setShowCart(false)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <span className="sr-only">Close</span>
                          ×
                        </button>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          {cart.length === 0 ? (
                            <p className="text-center text-gray-500">Your cart is empty</p>
                          ) : (
                            <ul className="-my-6 divide-y divide-gray-200">
                              {cart.map((item) => (
                                <li key={item.productId} className="py-6 flex">
                                  <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                      <h3>{item.name}</h3>
                                      <p className="ml-4">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center mt-2">
                                      <button
                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                        className="text-gray-500 hover:text-gray-700 px-2"
                                      >
                                        -
                                      </button>
                                      <span className="mx-2">{item.quantity}</span>
                                      <button
                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                        className="text-gray-500 hover:text-gray-700 px-2"
                                      >
                                        +
                                      </button>
                                      <span className="ml-4 text-sm text-gray-500">{item.unit}</span>
                                    </div>
                                    <button
                                      onClick={() => removeFromCart(item.productId)}
                                      className="mt-2 text-sm text-red-600 hover:text-red-500 text-left"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                    {cart.length > 0 && (
                      <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <p>Subtotal</p>
                          <p>Rs. {getCartTotal().toLocaleString()}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                          Shipping and taxes calculated at checkout.
                        </p>
                        <div className="mt-6">
                          <button
                            onClick={handleCheckout}
                            className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                          >
                            Checkout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}