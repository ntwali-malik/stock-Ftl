import { useState, useEffect, useCallback } from 'react';
import categoryService from '../services/categoryService';
import { useAuth } from './useAuth';

export const useCategories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getCategories();
      setCategories(data);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new category
  const createCategory = useCallback(async (categoryData) => {
    try {
      setLoading(true);
      setError(null);
      const newCategory = await categoryService.createCategory(categoryData);
      setCategories(prev => [newCategory, ...prev]);
      return newCategory;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a category
  const updateCategory = useCallback(async (categoryId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCategory = await categoryService.updateCategory(categoryId, updateData);
      setCategories(prev => 
        prev.map(category => 
          category._id === categoryId ? updatedCategory : category
        )
      );
      return updatedCategory;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a category
  const deleteCategory = useCallback(async (categoryId) => {
    try {
      setLoading(true);
      setError(null);
      await categoryService.deleteCategory(categoryId);
      setCategories(prev => prev.filter(category => category._id !== categoryId));
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get category by ID
  const getCategoryById = useCallback(async (categoryId) => {
    try {
      setLoading(true);
      setError(null);
      const category = await categoryService.getCategoryById(categoryId);
      return category;
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

  // Load categories only when user is authenticated
  useEffect(() => {
    if (user) {
      fetchCategories();
    } else {
      // Clear categories when user is not authenticated
      setCategories([]);
      setError(null);
    }
  }, [user, fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    clearError
  };
};

// Hook for managing a single category
export const useCategory = (categoryId) => {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch single category
  const fetchCategory = useCallback(async () => {
    if (!categoryId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getCategoryById(categoryId);
      setCategory(data);
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  // Update category
  const updateCategory = useCallback(async (updateData) => {
    if (!categoryId) return;

    try {
      setLoading(true);
      setError(null);
      const updatedCategory = await categoryService.updateCategory(categoryId, updateData);
      setCategory(updatedCategory);
      return updatedCategory;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  // Delete category
  const deleteCategory = useCallback(async () => {
    if (!categoryId) return;

    try {
      setLoading(true);
      setError(null);
      await categoryService.deleteCategory(categoryId);
      setCategory(null);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load category on mount
  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  return {
    category,
    loading,
    error,
    fetchCategory,
    updateCategory,
    deleteCategory,
    clearError
  };
};

export default useCategories;
