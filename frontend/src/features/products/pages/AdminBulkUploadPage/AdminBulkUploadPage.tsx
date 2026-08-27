import { useTranslation } from "react-i18next";
import { bulkProductRowSchema, type BulkProductRowInput } from "../../schema/productsSchema";
import { useRef, useState } from "react";
import { useBulkCreateProducts } from "../../hooks/useProductMutations";
import Papa from 'papaparse';
import { CheckCircle, FileSpreadsheet, Upload, XCircle } from "lucide-react";
import { downloadBulkTemplate } from "../../utils/downloadBulkTemplate";

export function AdminBulkUploadPage() {
    const { t } = useTranslation();

    // Rows that passed validation, ready to upload
    const [rows, setRows] = useState<BulkProductRowInput[]>([]);

    // Problems found while reading the CSV itself (before upload)
    const [parseErrors, setParseErrors] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const bulkCreate = useBulkCreateProducts();

    function handleFile(file: File) {
        setParseErrors([]);
        setRows([]);

        Papa.parse<Record<string, string>>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                const errors: string[] = [];
                const parsed: BulkProductRowInput[] = [];

                result.data.forEach((raw, i) => {
                    const parseResult = bulkProductRowSchema.safeParse(raw);

                    if (!parseResult.success) {
                        // +2 bcause arrays start at 0 and for the header row
                        const firstIssue = parseResult.error.issues[0];
                        errors.push(
                            t('products.admin.bulkRowInvalid', 'Row {{row}}: {{error}}', {
                                row: i + 2,
                                error: firstIssue?.message ?? 'Invalid Error',
                            })
                        );
                        return; // skip this row, don't add it to parsed
                    }

                    parsed.push(parseResult.data);
                });

                setRows(parsed);
                setParseErrors(errors);
            },
        });
    }

    return (
        <div className="mx-auto max-w-2xl px-4 pb-24 pt-6 md:pt-25">
            <h1 className="mb-2 text-xl font-semibold text-ink">
                {t('products.admin.bulkUploadTitle', 'Bulk Upload Products')}
            </h1>
            <p className="mb-6 text-sm text-muted">
                {t('products.admin.bulkUploadHint', 'CSV Columns: productName, categoryName, description, slug, sku, priceInCents, comparePrice, stock, isActive, isFeatured, imagesUrl, videosUrl, metadata. For imagesUrl/videosUrl, separate multiple urls with commas. metadata must be valid JSON, e.g. {"color":"red"}.}')}
            </p>

            <button 
                type="button" 
                onClick={downloadBulkTemplate}
                className="mb-6 text-sm font-medium text-accent underline underline-offset-2 hover:cursor-pointer"
            >
                {t('products.admin.downloadTemplate', 'Download CSV template')}
            </button>

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-2
                rounded-2xl border-2 border-dashed border-border py-10
                text-muted hover:border-accent/50 hover:text-ink hover:cursor-pointer"
            >
                <Upload size={24} />
                <span className="text-sm">{t('products.admin.selectCsv', 'Select a CSV file')}</span>
            </button>

            <input 
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {parseErrors.length > 0 && (
                <ul className="mt-4 space-y-1 rounded-xl bg-danger/10 p-4
                text-xs text-danger">
                    {parseErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                    ))}
                </ul>
            )}

            {/* Confirm button */}
            {rows.length > 0 && !bulkCreate.data && (
                <div className="mt-6">
                    <div className="mb-3 flex items-center gap-2 text-sm text-ink">
                        <FileSpreadsheet size={16} />
                        {t('products.admin.rowsReady', '{{count}} products ready to upload', { count: rows.length })}
                    </div>

                    <button 
                        type="button"
                        onClick={() => bulkCreate.mutate(rows)}
                        disabled={bulkCreate.isPending}
                        className="w-full rounded-full bg-accent py-3.5
                        text-sm font-semibold text-white disabled:opacity-60"
                    >
                        {bulkCreate.isPending
                            ? t('products.admin.uploading', 'Uploading...')
                            : t('products.admin.confirmUpload', 'Upload {{count}} products', { count: rows.length })
                        }
                    </button>
                </div>
            )}

            {/* Results shown after the backend responds */}
            {bulkCreate.data && (
                <div className="mt-6 space-y-2">
                    {bulkCreate.data.map((r) => (
                        <div
                            key={r.row}
                            className={`flex items-center gap-2 rounded-lg
                                p-3 text-sm
                                ${
                                    r.success ? 'bg-green-500/10 text-green-600'
                                    : 'bg-danger/10 text-danger'
                                }`}
                        >
                            {r.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            <span>
                                {t('products.admin.rowResult', 'Row {{row}}: ', { row: r.row + 1 })}
                                {r.success
                                    ? t('products.admin.rowSuccess', 'created')
                                    : t(`products.admin.errors.${r.error}`, r.error ?? 'Unknown error')
                                }
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}