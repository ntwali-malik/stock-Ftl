import { useState, useEffect, useCallback } from 'react';
import productService from '../services/productService';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts();
      setProducts(data);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new product
  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      setError(null);
      const newProduct = await productService.createProduct(productData);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a product
  const updateProduct = useCallback(async (productId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProduct = await productService.updateProduct(productId, updateData);
      setProducts(prev => 
        prev.map(product => 
          product._id === productId ? updatedProduct : product
        )
      );
      return updatedProduct;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a product
  const deleteProduct = useCallback(async (productId) => {
    try {
      setLoading(true);
      setError(null);
      await productService.deleteProduct(productId);
      setProducts(prev => prev.filter(product => product._id !== productId));
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get product by ID
  const getProductById = useCallback(async (productId) => {
    try {
      setLoading(true);
      setError(null);
      const product = await productService.getProductById(productId);
      return product;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    clearError
  };
};

// Hook for managing a single product
export const useProduct = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch single product
  const fetchProduct = useCallback(async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProductById(productId);
      setProduct(data);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Update product
  const updateProduct = useCallback(async (updateData) => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);
      const updatedProduct = await productService.updateProduct(productId, updateData);
      setProduct(updatedProduct);
      return updatedProduct;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Delete product
  const deleteProduct = useCallback(async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);
      await productService.deleteProduct(productId);
      setProduct(null);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load product on mount
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    fetchProduct,
    updateProduct,
    deleteProduct,
    clearError
  };
};

export default useProducts;
