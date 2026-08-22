/* eslint-disable react-hooks/rules-of-hooks */
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, ImagePlus, Save, Video, Tag, Hash, FileText, Boxes } from 'lucide-react';
import { useProductById } from "../../hooks/useProducts";
import { useCreateProduct, useUpdateProduct } from "../../hooks/useProductMutations";
import { useParseApiError } from "@/shared/hooks/useParseApiError";
import { createProductSchema, updateProductSchema, type CreateProductInput } from "../../schema/productsSchema";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { uploadProductImage, uploadProductVideo } from "../../services/productsApi";
import { FormField, type ZodFieldError } from "@/shared/components/FormField/FormField";
import { CategoryCombobox } from "../../components/CategoryCombobox/CategoryCombobox";
import { PriceInput } from "../../components/PriceInput/PriceInput";

export function AdminProductFormPage() {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const { data: existing } = useProductById(isEdit ? id! : '');
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const { t } = useTranslation();
    const [uploadingImages, setUploadingImages] = useState(0); // count of images currently uploading
    const [uploadingVideos, setUploadingVideos] = useState(0);
    const [failedImageUploads, setfailedImageUploads] = useState<{ name: string; error: string; }[]>([]);
    const [failedVideoUploads, setfailedVideoUploads] = useState<{ name: string; error: string; }[]>([]);

    const { register, handleSubmit, control, getValues, setValue, formState: { errors } } = useForm<CreateProductInput>({ 
        resolver: zodResolver(isEdit ? updateProductSchema : createProductSchema) as Resolver<CreateProductInput>,
        // Pre-fill input values on edit mode
        values: existing ? {
            categoryId: existing.categoryId ?? '',
            productName: existing.productName,
            productDescription: existing.description ?? '',
            slug: existing.slug,
            sku: existing.sku ?? '',
            stock: existing.stock,
            isActive: existing.isActive,
            isFeatured: existing.isFeatured,
            priceInCents: existing.priceInCents,
            comparePrice: existing.comparePrice ?? undefined,
            imagesUrl: existing.imagesUrl,
            videosUrl: existing.videosUrl,
            metadata: existing.metadata ?? {},
        } : undefined,
    });

    const mutation = isEdit ? updateProduct : createProduct;
    const { codes, hasCodes, fallbackMessage } = useParseApiError(mutation.error);

    const onSubmit = (data: CreateProductInput) => {
        const payload = { ...data, categoryId: data.categoryId || undefined };
        
        if (isEdit) {
            updateProduct.mutate({ id: id!, input: payload }, { 
                onSuccess: () => navigate(`/products/${payload.slug}`),
            });
        } else {
            createProduct.mutate(payload, {
                onSuccess: () => navigate(`/products/${payload.slug}`),
            });
        }
    }

    async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;
        
        setUploadingImages(files.length);

        try {
            const results = await Promise.allSettled(
                files.map((file) => uploadProductImage(file))
            );

            const succeeded = results
                .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
                .map((r) => r.value);

            if (succeeded.length > 0) {
                const current = getValues('imagesUrl') ?? [];
                setValue('imagesUrl', [...current, ...succeeded]); // merges all new urls into the array
            }

            const failed: { name: string; error: string }[] = [];

            results.forEach((result, i) => {
                if (result.status === 'rejected') {
                    const { codes, hasCodes, fallbackMessage } = useParseApiError(result.reason);
                    failed.push({ 
                        name: files[i].name, 
                        error: hasCodes
                            ? t(`products.admin.errors.${codes[0]}`, codes[0])
                            : fallbackMessage ?? t('products.admin.uploadFailedGeneric', 'Upload failed'),
                    });
                }
            })

            if (failed.length > 0) {
                setfailedImageUploads(failed);
            }
        } finally {
            setUploadingImages(0);
            e.target.value = '';
        }
    }

    async function handleVideoPick(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;

        setUploadingVideos(files.length);
        setfailedVideoUploads([]);

        try {
            const results = await Promise.allSettled(
                files.map((file) => uploadProductVideo(file, file.name))
            );

            const succeeded: string[] = [];
            const failed: { name: string; error: string }[] = [];

            results.forEach((result, i) => {
                if (result.status === 'fulfilled') {
                    succeeded.push(result.value.embedUrl);
                } else {
                    const { codes, hasCodes, fallbackMessage } = useParseApiError(result.reason);
                    failed.push({
                        name: files[i].name,
                        error: hasCodes
                            ? t(`products.admin.errors.${codes[0]}`, codes[0])
                            : fallbackMessage ?? t('products.admin.uploadFailedGeneric', 'Upload failed'),
                    });
                }
            });

            if (succeeded.length > 0) {
                const current = getValues('videosUrl') ?? [];
                setValue('videosUrl', [...current, ...succeeded]);
            }

            if (failed.length > 0) {
                setfailedVideoUploads(failed);
            }
        } finally {
            setUploadingVideos(0);
            e.target.value = '';
        }
    }

    return (
        <div className="mx-auto max-w-lg px-4 pb-24 pt-6 md:pt-16">

            {/* Header */}
            <div className="mb-6 items-center justify-between">

                <h1 className="text-xl font-semibold tex-ink">
                    {isEdit 
                        ? t('products.admin.editTitle', 'Edit Product') 
                        : t('products.admin.addTitle', 'Edit Product')
                    }
                </h1>

                <button
                    onClick={() => navigate('/admin/products')}
                    className="text-muted hover:text-ink"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                
                {/* Images upload */}
                <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                        {t('products.admin.images', 'Product Images')}
                    </p>

                    <div className="flex-flex-wrap gap-2">

                        {/* One thumbnail per already-uploaded image url stored in the form */}
                        {(getValues('imagesUrl') ?? []).map((url) => (
                            <img key={url} src={url} alt="" className="h-20 w-20 rounded-xl object-cover" />
                        ))}

                        {/* Upload button */}
                        <label className="flex-h-20 w-20 cursor-pointer flex-col items-center justify-center
                         gap-1 rounded-xl border-2 border-dashed border-border text-muted
                         hover:border-accent/50 hover:text-ink">

                            {/* Shows a live count while uploads are being uploaded */}
                            {uploadingImages > 0 ? (
                                <span className="text-[0.625rem]">
                                    {t('products.admin.uploadingCount', '{{count}} uploading...', { count: uploadingImages })}
                                </span>
                            ) : (
                                <>
                                    <ImagePlus size={20} />
                                    <span className="text-[0.625rem]">{t('products.admin.upload', 'Upload')}</span>
                                </>
                            )}

                            <input type="file" accept="image/jpeg,image/png,image/webp" multiple
                            onChange={handleImagePick} disabled={uploadingImages > 0} className="hidden" />
                        </label>
                    </div>
                </div>

                {/* Error list for images */}
                {failedImageUploads.length > 0 && (
                    <ul className="space-y-1 rounded-lg bg-danger/10 p-3
                    text-xs text-danger">
                        {failedImageUploads.map((f, i) => (
                            <li key={i}>{t('products.admin.uploadFail', '{{name}}: {{error}}', { name: f.name, error: f.error })}</li>
                        ))}
                    </ul>
                )}

                {/* Videos upload */}
                <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                        {t('products.admin.videos', 'Product Videos')}
                    </p>

                    <div className="flex flex-wrap gap-2">

                        {(getValues('videosUrl') ?? []).map((url) => (
                            <div key={url} className="flex h-20 w-32 items-center
                            justify-center rounded-xl bg-surface-2 text-[0.625rem]
                            text-muted break-all p-1">
                                {url}
                            </div>
                        ))}

                        <label className="flex h-20 w-20 cursor-pointer flex-col items-center
                        justify-center gap-1 rounded-xl border-2 border-dashed border-border
                        text-muted hover:border-accent/50 hover:text-ink">
                            
                            {uploadingVideos > 0 ? (
                                <span className="text-[0.625rem]">
                                    {t('products.admin.uploadingCount', '{{count}} uploading...', { count: uploadingVideos })}
                                </span>
                            ) : (
                                <>
                                    <Video size={20} />
                                    <span className="text-[0.625rem]">{t('products.admin.upload', 'Upload')}</span>
                                </>
                            )}

                            <input type="file" accept="video/*" multiple 
                            onChange={handleVideoPick} disabled={uploadingVideos > 0}
                            className="hidden" />

                        </label>
                    </div>
                </div>

                {/* Error list for videos */}
                {failedVideoUploads.length > 0 && (
                    <ul className="space-y-1 rounded-lg bg-danger/10 p-3
                    text-xs text-danger">
                        {failedVideoUploads.map((f, i) => (
                            <li key={i}>{t('products.admin.uploadFail', '{{name}}: {{error}}', { name: f.name, error: f.error })}</li>
                        ))}
                    </ul>
                )}

                {/* Identity field: Name */}
                <FormField
                    label={t('products.admin.name', 'Product Name')}
                    icon={Tag} placeholder={t('products.admin.namePlaceholder', 'e.g. AirPods Pro')}
                    error={errors.productName} {...register('productName')}
                />

                {/* Identity field: Slug */}
                <FormField 
                    label={t('products.admin.slug', 'Slug')}
                    icon={Hash} placeholder={t('products.admin.slugPlaceholder', 'e.g. airpods-pro')}
                    error={errors.slug} {...register('slug')}
                />

                {/* Identity field: SKU */}
                <FormField 
                    label={t('products.admin.sku', 'SKU')}
                    icon={FileText} placeholder={t('products.admin.skuPlaceholder', 'e.g. APP-2ND-GEN')}
                    error={errors.sku} {...register('sku')}
                />

                {/* Category dropdown */}
                <Controller 
                    control={control}
                    name="categoryId"
                    render={({ field }) => (
                        <CategoryCombobox 
                            value={field.value ?? ''}
                            initialName={existing?.categoryName ?? undefined}
                            initialImageUrl={existing?.categoryImageUrl}
                            onChange={(id) => field.onChange(id) }
                        />
                    )}
                />
                {errors.categoryId && <span className="text-xs text-danger">
                        {t(`products.admin.errors.${(errors.categoryId as ZodFieldError).params?.code}`, errors.categoryId.message ?? '')}
                    </span>}

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-3">
                    <Controller 
                        control={control}
                        name="priceInCents"
                        render={({ field }) => (
                            <PriceInput 
                                label={t('products.admin.price', 'Price')}
                                valueInDollars={(field.value ?? 0) / 100}
                                onCommit={(dollars) => field.onChange(Math.round(dollars * 100))}
                            />
                        )}
                    />
                    <Controller 
                        control={control}
                        name="comparePrice"
                        render={({ field }) => (
                            <PriceInput 
                                label={t('products.admin.comparePrice', 'Compare Price')}
                                valueInDollars={(field.value ?? 0) / 100}
                                onCommit={(dollars) => field.onChange(Math.round(dollars * 100))}
                            />
                        )}
                    />
                </div>
                {errors.priceInCents && <span className="text-xs text-danger">{t(`products.admin.errors.${(errors.priceInCents as ZodFieldError).params?.code}`, errors.priceInCents.message ?? '')}</span>}
                {errors.comparePrice && <span className="text-xs text-danger">{t(`products.admin.errors.${(errors.comparePrice as ZodFieldError).params?.code}`, errors.comparePrice.message ?? '')}</span>}

                {/* Stock quantity */}
                <FormField 
                    label={t('products.admin.stock', 'Stock')}
                    icon={Boxes}
                    type="number"
                    placeholder="0"
                    error={errors.stock}
                    {...register('stock')}
                />

                {/* Description textarea */}
                <label className="block">
                    <span className="mb-1 block text-sm font-medium text-ink">
                        {t('products.admin.description', 'Description')}
                    </span>

                    <textarea 
                        {...register('productDescription')}
                        rows={4}
                        placeholder={t('products.admin.descriptionPlaceholder', 'Describe the product features and details...')}
                        className="w-full rounded-lg border border-border bg-surface-2 px-3 
                        py-2.5 text-sm text-ink outline-none focus:border-accent"
                    />

                    {errors.productDescription && <span className="text-xs text-danger">
                        {t(`products.admin.errors.${(errors.productDescription as ZodFieldError).params?.code}`, errors.productDescription.message ?? '')}
                    </span>}
                </label>

                {/* Active/isFeatured toggles */}
                <div className="flex items-center gap-6">
                    
                    {/* Is active check box */}
                    <label className="flex items-center gap-2 text-sm text-ink">
                        <input 
                            type="checkbox" 
                            {...register('isActive')} 
                            className="h-4 w-4 rounded border-border" 
                        />
                        {t('products.admin.active', 'Active (visible to customers)')}
                    </label>

                    {/* Is featured check box */}
                    <label className="flex items-center gap-2 text-sm text-ink">
                        <input 
                            type="checkbox" 
                            {...register('isFeatured')} 
                            className="h-4 w-4 rounded border-border" 
                        />
                        {t('products.admin.featured', 'Featured')}
                    </label>

                </div>

                {/* Server error display */}
                {mutation.error && (
                    hasCodes
                        ? <ul className="text-xs text-danger">
                            {codes.map((c, i) => <li key={i}>{t(`products.admin.errors.${c}`, `${c}`)}</li>)}
                          </ul>
                        : <p className="text-xs text-danger">{fallbackMessage}</p>
                )}

                {/* Submit button */}
                <button 
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-accent
                    py-3.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                    <Save size={16} />

                    {mutation.isPending ? t('products.admin.saving', 'Saving...') : t('products.admin.save', 'Save Product')}
                </button>
                
            </form>
        </div>
    );


}
