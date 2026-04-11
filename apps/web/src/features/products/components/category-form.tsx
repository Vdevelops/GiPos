'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
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
import { useCreateCategory, useUpdateCategory, useCategories } from '../hooks/use-categories';
import type { Category } from '../types/category';

// Form schema
const categorySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().optional(),
  description: z.string().optional(),
  parent_id: z.string().optional().nullable(),
  image_url: z.string().optional(),
  sort_order: z.number().int().min(0),
  status: z.enum(['active', 'inactive']),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly category?: Category | null;
}

export function CategoryForm({
  open,
  onOpenChange,
  category,
}: CategoryFormProps) {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const isEdit = !!category;

  const { data: categoriesData } = useCategories({ per_page: 100 });
  const categories = categoriesData?.data ?? [];

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parent_id: null,
      image_url: '',
      sort_order: 0,
      status: 'active' as const,
    },
  });

  // Reset form when category changes
  useEffect(() => {
    if (category && open) {
      reset({
        name: category?.name ?? '',
        slug: category?.slug ?? '',
        description: category?.description ?? '',
        parent_id: category?.parent_id ?? null,
        image_url: category?.image_url ?? '',
        sort_order: category?.sort_order ?? 0,
        status: category?.status === 'inactive' ? 'inactive' : 'active',
      });
    } else if (!category && open) {
      reset({
        name: '',
        slug: '',
        description: '',
        parent_id: null,
        image_url: '',
        sort_order: 0,
        status: 'active',
      });
    }
  }, [category, open, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const payload = {
        name: data.name,
        slug: data.slug || null,
        description: data.description || null,
        parent_id: data.parent_id || null,
        image_url: data.image_url || null,
        sort_order: data.sort_order,
        status: data.status,
      };

      if (isEdit && category?.id) {
        await updateMutation.mutateAsync({
          id: category.id,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      onOpenChange(false);
    } catch (error) {
      // Error is handled by mutation hooks
      console.error('Form submission error:', error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Filter out current category and its children from parent options
  const availableParents = categories.filter(
    (cat) => cat?.id !== category?.id && cat?.parent_id !== category?.id
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('editCategory') : t('addCategory')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('editCategoryDesc')
              : t('addCategoryDesc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t('categoryName')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder={t('categoryNamePlaceholder')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">{t('slug')}</Label>
                <Input
                  id="slug"
                  {...register('slug')}
                  placeholder="category-slug"
                />
              </div>
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="parent_id">{t('parentCategory')}</Label>
                <Select
                  value={watch('parent_id') ?? 'none'}
                  onValueChange={(value) =>
                    setValue('parent_id', value === 'none' ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectParentCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('noParent')}</SelectItem>
                    {availableParents.map((cat) => (
                      <SelectItem key={cat?.id ?? 'unknown'} value={cat?.id ?? ''}>
                        {cat?.name ?? 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">{t('sortOrder')}</Label>
                <Input
                  id="sort_order"
                  type="number"
                  {...register('sort_order', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">{t('imageUrl')}</Label>
              <Input
                id="image_url"
                type="url"
                {...register('image_url')}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t('status')}</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) =>
                  setValue('status', value as 'active' | 'inactive')
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="inactive">{t('inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
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
