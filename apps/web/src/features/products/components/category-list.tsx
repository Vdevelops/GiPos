'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, MoreVertical, Edit, Trash2, Folder } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategories, useDeleteCategory } from '../hooks/use-categories';
import { CategoryForm } from './category-form';
import { DeleteDialog } from '@/components/delete-dialog';
import type { Category } from '../types/category';

interface CategoryListProps {
  readonly onAddCategory?: () => void;
  readonly onEditCategory?: (category: Category) => void;
}

export function CategoryList({ onAddCategory, onEditCategory }: CategoryListProps) {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const [page, setPage] = useState(1);
  const perPage = 50;
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowAddForm(true);
    onAddCategory?.();
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowAddForm(true);
    onEditCategory?.(category);
  };

  const { data: categoriesData, isLoading } = useCategories({
    page,
    per_page: perPage,
    status: 'active',
  });

  const deleteCategoryMutation = useDeleteCategory();

  const categories = categoriesData?.data ?? [];
  const pagination = categoriesData?.meta?.pagination;

  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const handleDelete = async () => {
    if (deletingCategory?.id) {
      await deleteCategoryMutation.mutateAsync(deletingCategory.id);
      setDeletingCategory(null);
    }
  };

  // Build hierarchical structure
  const rootCategories = categories.filter((cat) => !cat?.parent_id);
  const childCategoriesMap = new Map<string, Category[]>();
  
  categories.forEach((cat) => {
    if (cat?.parent_id) {
      const parentId = cat.parent_id;
      if (!childCategoriesMap.has(parentId)) {
        childCategoriesMap.set(parentId, []);
      }
      childCategoriesMap.get(parentId)?.push(cat);
    }
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('productCategories')}</h2>
          <p className="text-muted-foreground">
            {pagination?.total ?? 0} {t('categoriesFound')}
          </p>
        </div>
        <Button onClick={handleAddCategory} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t('addCategory')}
        </Button>
      </div>

      {/* Categories Grid */}
      <Card>
        <CardHeader>
          <CardTitle>{t('categories')}</CardTitle>
          <CardDescription>
            {t('productCategoriesDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Folder className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('noCategories')}</p>
              <Button variant="outline" className="mt-4" onClick={handleAddCategory}>
                <Plus className="mr-2 h-4 w-4" />
                {t('addFirstCategory')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rootCategories.map((category) => {
                const children = childCategoriesMap.get(category?.id ?? '') ?? [];

                return (
                  <Card key={category?.id ?? 'unknown'}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <p className="font-medium truncate">
                              {category?.name ?? 'Unknown Category'}
                            </p>
                          </div>
                          {category?.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {category.description}
                            </p>
                          )}
                          {children.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {children.slice(0, 3).map((child) => (
                                <div
                                  key={child?.id ?? 'unknown'}
                                  className="text-xs text-muted-foreground flex items-center gap-1"
                                >
                                  <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                                  {child?.name ?? 'Unknown'}
                                </div>
                              ))}
                              {children.length > 3 && (
                                <p className="text-xs text-muted-foreground">
                                  +{children.length - 3} more
                                </p>
                              )}
                            </div>
                          )}
                          <Badge variant="outline" className="mt-2">
                            {t('sortOrder')}: {category?.sort_order ?? 0}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {tCommon('edit')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeletingCategory(category)}
                              disabled={deleteCategoryMutation.isPending}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {tCommon('delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.total_pages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.has_prev || page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.has_next || page === pagination.total_pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Form Dialog */}
      <CategoryForm
        open={showAddForm}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddForm(false);
            setEditingCategory(null);
          }
        }}
        category={editingCategory}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deletingCategory}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
        onConfirm={handleDelete}
        itemName={deletingCategory?.name}
        isLoading={deleteCategoryMutation.isPending}
      />
    </div>
  );
}
