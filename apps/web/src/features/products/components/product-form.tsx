'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Loader2, X, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateProduct, useUpdateProduct } from '../hooks/use-products';
import { useCategories } from '../hooks/use-categories';
import { useUploadImage } from '../hooks/use-upload';
import { useBulkCreateProductImages } from '../hooks/use-product-images';
import { rupiahToSen, senToRupiah } from '@/lib/currency';
import type { Product } from '../types';

// Form schema
const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(1, 'Price must be greater than 0'),
  cost: z.number().min(0).optional(),
  category_id: z.string().optional().nullable(),
  taxable: z.boolean(),
  track_stock: z.boolean(),
  status: z.enum(['active', 'inactive', 'archived']),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly product?: Product | null;
}

export function ProductForm({ open, onOpenChange, product }: ProductFormProps) {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const isEdit = !!product;

  const { data: categoriesData } = useCategories({ per_page: 100 });
  const categories = categoriesData?.data ?? [];

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const uploadImageMutation = useUploadImage();
  const bulkCreateImagesMutation = useBulkCreateProductImages();

  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; file: File }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      barcode: '',
      description: '',
      price: 0,
      cost: 0,
      category_id: null,
      taxable: false,
      track_stock: true,
      status: 'active' as const,
    },
  });

  const taxable = watch('taxable');
  const trackStock = watch('track_stock');

  // Reset form when product changes
  useEffect(() => {
    if (product && open) {
      reset({
        name: product?.name ?? '',
        sku: product?.sku ?? '',
        barcode: product?.barcode ?? '',
        description: product?.description ?? '',
        price: senToRupiah(product?.price ?? 0),
        cost: product?.cost ? senToRupiah(product.cost) : 0,
        category_id: product?.category_id ?? null,
        taxable: product?.taxable ?? false,
        track_stock: product?.track_stock ?? true,
        status: (() => {
          if (product?.status === 'inactive') return 'inactive';
          if (product?.status === 'archived') return 'archived';
          return 'active';
        })(),
      });
    } else if (!product && open) {
      reset({
        name: '',
        sku: '',
        barcode: '',
        description: '',
        price: 0,
        cost: 0,
        category_id: null,
        taxable: false,
        track_stock: true,
        status: 'active' as const,
      });
      setUploadedImages([]);
    }
  }, [product, open, reset]);

  const handleImageUpload = async (file: File) => {
    try {
      const result = await uploadImageMutation.mutateAsync({
        file,
        folder: 'products',
      });
      setUploadedImages((prev) => [...prev, { url: result.url, file }]);
    } catch (error) {
      console.error('Image upload error:', error);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      const payload = {
        name: data.name,
        sku: data.sku,
        barcode: data.barcode || null,
        description: data.description || null,
        price: rupiahToSen(data.price),
        cost: data.cost ? rupiahToSen(data.cost) : null,
        category_id: data.category_id || null,
        taxable: data.taxable,
        track_stock: data.track_stock,
        status: data.status,
      };

      let productId: string;
      if (isEdit && product?.id) {
        await updateMutation.mutateAsync({
          id: product.id,
          data: payload,
        });
        productId = product.id;
      } else {
        const response = await createMutation.mutateAsync(payload);
        // Response is ApiResponse<Product>, extract the product
        if (response?.success && response?.data) {
          productId = response.data.id;
        } else {
          throw new Error('Failed to create product');
        }
      }

      // Upload images if any (only new uploads, not existing images)
      const newImages = uploadedImages.filter((img) => img.file.size > 0);
      if (newImages.length > 0 && productId) {
        await bulkCreateImagesMutation.mutateAsync({
          productId,
          data: {
            images: newImages.map((img, index) => ({
              url: img.url,
              order: index + 1,
              alt: data.name,
            })),
          },
        });
      }

      // Reset uploaded images
      setUploadedImages([]);
      onOpenChange(false);
    } catch (error) {
      // Error is handled by mutation hooks
      console.error('Form submission error:', error);
    }
  };

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadImageMutation.isPending ||
    bulkCreateImagesMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('editProduct') : t('addProduct')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('editProductDesc')
              : t('addProductDesc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t('productName')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder={t('productNamePlaceholder')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">
                  SKU <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sku"
                  {...register('sku')}
                  placeholder="PRD-001"
                  disabled={isEdit}
                />
                {errors.sku && (
                  <p className="text-sm text-destructive">{errors.sku.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">{t('barcode')}</Label>
              <Input
                id="barcode"
                {...register('barcode')}
                placeholder={t('barcodePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder={t('descriptionPlaceholder')}
                rows={3}
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label>{t('productImages')}</Label>
              <div className="flex flex-wrap gap-4">
                {uploadedImages.map((img, index) => (
                  <div key={`${img.url}-${index}`} className="relative">
                    <div className="relative h-24 w-24 overflow-hidden rounded-lg border">
                      <img
                        src={img.url}
                        alt={`Upload ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-1 top-1 h-6 w-6"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                <label
                  htmlFor="image-upload"
                  className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50"
                >
                  <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t('uploadImage')}</span>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file);
                      }
                    }}
                    disabled={uploadImageMutation.isPending}
                  />
                </label>
              </div>
              {uploadImageMutation.isPending && (
                <p className="text-sm text-muted-foreground">{t('uploadingImage')}...</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  {t('price')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">{t('cost')}</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  {...register('cost', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">{t('category')}</Label>
              <Select
                value={watch('category_id') ?? 'none'}
                onValueChange={(value) =>
                  setValue('category_id', value === 'none' ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('noCategory')}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category?.id ?? 'unknown'} value={category?.id ?? ''}>
                      {category?.name ?? 'Unknown'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('taxable')}</Label>
                <p className="text-sm text-muted-foreground">{t('taxableDesc')}</p>
              </div>
              <Switch
                checked={taxable}
                onCheckedChange={(checked) => setValue('taxable', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('trackStock')}</Label>
                <p className="text-sm text-muted-foreground">{t('trackStockDesc')}</p>
              </div>
              <Switch
                checked={trackStock}
                onCheckedChange={(checked) => setValue('track_stock', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t('status')}</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) =>
                  setValue('status', value as 'active' | 'inactive' | 'archived')
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="inactive">{t('inactive')}</SelectItem>
                  <SelectItem value="archived">{t('archived')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? tCommon('update') : tCommon('create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
