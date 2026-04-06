'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductList } from './product-list';
import { ProductForm } from './product-form';
import { ProductDetail } from './product-detail';
import { CategoryList } from './category-list';
import { StockManagement } from './stock-management';
import { WarehouseList } from './warehouse-list';
import { useTranslations } from 'next-intl';
import type { Product } from '../types';

export function ProductInventory() {
  const t = useTranslations('products');
  const [activeTab, setActiveTab] = useState('products');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProductId, setViewingProductId] = useState<string | null>(null);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowAddForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleViewProduct = (product: Product) => {
    setViewingProductId(product?.id ?? null);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const handleCloseDetail = () => {
    setViewingProductId(null);
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">{t('products')}</TabsTrigger>
          <TabsTrigger value="categories">{t('categories')}</TabsTrigger>
          <TabsTrigger value="warehouses">{t('warehouses')}</TabsTrigger>
          <TabsTrigger value="stock">{t('stockManagement')}</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4">
          <ProductList
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onViewProduct={handleViewProduct}
          />
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <CategoryList />
        </TabsContent>

        <TabsContent value="warehouses" className="mt-4">
          <WarehouseList />
        </TabsContent>

        <TabsContent value="stock" className="mt-4">
          <StockManagement />
        </TabsContent>
      </Tabs>

      <ProductForm
        open={showAddForm}
        onOpenChange={handleCloseForm}
        product={editingProduct}
      />

      <ProductDetail
        open={!!viewingProductId}
        onOpenChange={handleCloseDetail}
        productId={viewingProductId}
      />
    </>
  );
}
