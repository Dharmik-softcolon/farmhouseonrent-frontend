import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { farmhouseAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
    FiUploadCloud, FiDownload, FiCheckCircle, FiAlertTriangle,
    FiX, FiArrowLeft, FiEye, FiSend
} from 'react-icons/fi';

// ── CSV Parser (no dependency needed) ──────────────────────────────────────
function parseCSV(text) {
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Handle quoted fields (fields may contain commas inside quotes)
        const values = [];
        let inQuote = false;
        let current = '';
        for (let c = 0; c < line.length; c++) {
            const ch = line[c];
            if (ch === '"') {
                inQuote = !inQuote;
            } else if (ch === ',' && !inQuote) {
                values.push(current.trim());
                current = '';
            } else {
                current += ch;
            }
        }
        values.push(current.trim());

        const row = {};
        headers.forEach((h, idx) => {
            row[h] = values[idx] !== undefined ? values[idx].replace(/^"|"$/g, '') : '';
        });
        rows.push(row);
    }
    return rows;
}

// ── Required & optional columns ────────────────────────────────────────────
const REQUIRED_COLS = ['title', 'description', 'city', 'fullAddress', 'contactNumber', 'priceWeekday', 'priceWeekend', 'maxGuests'];
const OPTIONAL_COLS = ['subLocation', 'googleMapLink', 'facilities', 'images'];
const ALL_COLS = [...REQUIRED_COLS, ...OPTIONAL_COLS];

function validateRow(row, idx) {
    const errs = [];
    if (!row.title?.trim()) errs.push('title missing');
    if (!row.description?.trim()) errs.push('description missing');
    if (!row.city?.trim()) errs.push('city missing');
    if (!row.fullAddress?.trim()) errs.push('fullAddress missing');
    if (!row.contactNumber?.trim() || !/^[6-9]\d{9}$/.test(row.contactNumber.trim())) errs.push('contactNumber invalid');
    if (!row.priceWeekday || isNaN(Number(row.priceWeekday)) || Number(row.priceWeekday) < 0) errs.push('priceWeekday invalid');
    if (!row.priceWeekend || isNaN(Number(row.priceWeekend)) || Number(row.priceWeekend) < 0) errs.push('priceWeekend invalid');
    if (!row.maxGuests || isNaN(Number(row.maxGuests)) || Number(row.maxGuests) < 1) errs.push('maxGuests invalid');
    return errs;
}

// ── Sample CSV generator ────────────────────────────────────────────────────
function downloadSampleCSV() {
    const header = ALL_COLS.join(',');
    const rows = [
        [
            'Green Valley Farmhouse',
            'A beautiful farmhouse with a large swimming pool and lush gardens perfect for family getaways.',
            'Surat',
            'Survey No. 123, Near NH-48, Palsana, Surat',
            '6356079603',
            '6000',
            '9000',
            '30',
            'Palsana',
            '',
            'pool:big|garden:medium|ac|wifi|parking|waterpark',
            ''
        ],
        [
            'Sunrise Family Farm',
            'Spacious farmhouse with 2 big pools outdoor games and complete catering facilities for large groups.',
            'Surat',
            'Plot 45, Olpad Highway, Olpad, Surat - 394540',
            '6356079603',
            '8000',
            '12000',
            '50',
            'Olpad',
            'https://maps.google.com/?q=Olpad',
            'pool:big|ac|kitchen|parking|wifi|security|outdoor_games|music_system',
            ''
        ],
        [
            'Royal Green Resort',
            'Premium farmhouse with 4 luxury bedrooms khatla setups and private garden.',
            'Surat',
            'Nr. Dandi Roal, Sevni Village, Surat',
            '6356079603',
            '10000',
            '15000',
            '40',
            'Sevni',
            '',
            'garden:big|ac|wifi|kitchen|parking|caretaker|kids_play_area|bed:4|khatla:6',
            ''
        ]
    ].map(r => r.map(v => `"${v}"`).join(','));

    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'farmhouse_bulk_upload_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// ── Main Component ──────────────────────────────────────────────────────────
const BulkUploadFarmhouse = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef();

    const [step, setStep] = useState('upload'); // 'upload' | 'preview' | 'result'
    const [rows, setRows] = useState([]);
    const [rowErrors, setRowErrors] = useState({});
    const [missingCols, setMissingCols] = useState([]);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    const processFile = (file) => {
        if (!file || !file.name.endsWith('.csv')) {
            toast.error('Please upload a .csv file');
            return;
        }
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = parseCSV(e.target.result);
                if (parsed.length === 0) { toast.error('CSV has no data rows'); return; }

                // Check required columns
                const cols = Object.keys(parsed[0]);
                const missing = REQUIRED_COLS.filter(c => !cols.includes(c));
                setMissingCols(missing);

                // Validate each row
                const errs = {};
                parsed.forEach((row, i) => {
                    const e = validateRow(row, i);
                    if (e.length > 0) errs[i] = e;
                });
                setRows(parsed);
                setRowErrors(errs);
                setStep('preview');
            } catch (err) {
                toast.error('Failed to parse CSV: ' + err.message);
            }
        };
        reader.readAsText(file);
    };

    const handleFileChange = (e) => processFile(e.target.files[0]);
    const handleDrop = (e) => {
        e.preventDefault(); setDragOver(false);
        processFile(e.dataTransfer.files[0]);
    };

    const validRows = rows.filter((_, i) => !rowErrors[i]);
    const invalidCount = Object.keys(rowErrors).length;

    const handleSubmit = async () => {
        if (validRows.length === 0) { toast.error('No valid rows to upload'); return; }
        setLoading(true);
        try {
            const res = await farmhouseAPI.bulkCreate(validRows);
            setResult(res.data);
            setStep('result');
            toast.success(res.data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Bulk upload failed');
        } finally {
            setLoading(false);
        }
    };

    const resetUpload = () => {
        setStep('upload'); setRows([]); setRowErrors({});
        setMissingCols([]); setFileName(''); setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate('/admin/dashboard')}
                    className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FiUploadCloud className="w-6 h-6 text-primary-600" />
                        Bulk Upload Farmhouses (CSV)
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">Upload up to 200 farmhouses at once — images can be added later via Edit</p>
                </div>
            </div>

            {/* Step: UPLOAD */}
            {step === 'upload' && (
                <div className="space-y-6">
                    {/* Download Sample */}
                    <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex-1">
                            <p className="font-semibold text-primary-800 text-sm">📥 Download the Sample CSV first</p>
                            <p className="text-primary-600 text-xs mt-1">
                                Fill it with your farm data. Required columns: <code className="bg-primary-100 px-1 rounded">{REQUIRED_COLS.join(', ')}</code>
                            </p>
                        </div>
                        <button onClick={downloadSampleCSV}
                            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-all shadow-sm flex-shrink-0">
                            <FiDownload className="w-4 h-4" />
                            Download Sample CSV
                        </button>
                    </div>

                    {/* Facilities format help */}
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                        <p className="font-semibold text-amber-800 text-sm mb-2">📋 Column Format Guide</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-amber-700">
                            <div><span className="font-semibold">facilities:</span> Use <code className="bg-amber-100 px-1 rounded">|</code> to separate items:<br />
                                <code className="bg-amber-100 px-1 rounded text-[11px]">pool:big|garden:medium|ac|wifi|parking</code></div>
                            <div><span className="font-semibold">images:</span> Optional URL(s) separated by <code className="bg-amber-100 px-1 rounded">|</code>. Leave blank — a placeholder is used automatically.</div>
                            <div><span className="font-semibold">subLocation:</span> Only for Surat farms. Values: Palsana, Gaypagla, Velanja, Sevni, Olpad, Dandi Road</div>
                            <div><span className="font-semibold">contactNumber:</span> 10-digit Indian mobile starting with 6-9 (e.g. 9876543210)</div>
                        </div>
                    </div>

                    {/* Drop Zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
                            ${dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/50'}`}
                    >
                        <FiUploadCloud className="w-12 h-12 text-primary-400 mx-auto mb-3" />
                        <p className="text-gray-700 font-semibold text-base">Drop your CSV file here</p>
                        <p className="text-gray-400 text-sm mt-1">or click to browse</p>
                        <p className="text-gray-300 text-xs mt-3">Supports .csv files up to 200 rows</p>
                        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                    </div>
                </div>
            )}

            {/* Step: PREVIEW */}
            {step === 'preview' && (
                <div className="space-y-5">
                    {/* Summary bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Total Rows', value: rows.length, color: 'bg-gray-50 text-gray-700' },
                            { label: '✅ Valid', value: validRows.length, color: 'bg-green-50 text-green-700' },
                            { label: '❌ Invalid', value: invalidCount, color: invalidCount > 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-400' },
                            { label: 'File', value: fileName, color: 'bg-primary-50 text-primary-700' },
                        ].map((s, i) => (
                            <div key={i} className={`rounded-xl p-4 border border-white/50 ${s.color}`}>
                                <p className="text-xs font-medium opacity-70">{s.label}</p>
                                <p className="text-lg font-bold truncate">{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Missing columns warning */}
                    {missingCols.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                            <FiAlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-red-700 text-sm">Missing required columns in CSV:</p>
                                <p className="text-red-600 text-xs mt-1">{missingCols.join(', ')}</p>
                            </div>
                        </div>
                    )}

                    {/* Row errors */}
                    {invalidCount > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                            <p className="font-semibold text-orange-700 text-sm flex items-center gap-2">
                                <FiAlertTriangle className="w-4 h-4" />
                                {invalidCount} row(s) have errors and will be skipped:
                            </p>
                            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                                {Object.entries(rowErrors).map(([idx, errs]) => (
                                    <div key={idx} className="text-xs text-orange-600 flex gap-2">
                                        <span className="font-semibold flex-shrink-0">Row {Number(idx) + 2}
                                            {rows[idx]?.title ? ` (${rows[idx].title})` : ''}:
                                        </span>
                                        <span>{errs.join('; ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Preview Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                            <FiEye className="w-4 h-4 text-primary-600" />
                            <span className="font-semibold text-gray-800 text-sm">Preview (showing all {rows.length} rows)</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500">#</th>
                                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500">Status</th>
                                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500">Title</th>
                                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500">City</th>
                                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500">Sub-location</th>
                                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500">Weekday ₹</th>
                                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500">Weekend ₹</th>
                                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500">Guests</th>
                                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500">Contact</th>
                                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500">Facilities</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {rows.map((row, i) => {
                                        const hasErr = !!rowErrors[i];
                                        return (
                                            <tr key={i} className={hasErr ? 'bg-red-50' : 'hover:bg-gray-50'}>
                                                <td className="px-4 py-2.5 text-gray-400">{i + 2}</td>
                                                <td className="px-4 py-2.5">
                                                    {hasErr ? (
                                                        <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                                                            <FiX className="w-3 h-3" /> Skip
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                                                            <FiCheckCircle className="w-3 h-3" /> OK
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2.5 font-medium text-gray-800 max-w-[180px] truncate">{row.title || '—'}</td>
                                                <td className="px-4 py-2.5 text-gray-600">{row.city || '—'}</td>
                                                <td className="px-4 py-2.5 text-gray-600">{row.subLocation || '—'}</td>
                                                <td className="px-4 py-2.5 text-gray-600">{row.priceWeekday || '—'}</td>
                                                <td className="px-4 py-2.5 text-gray-600">{row.priceWeekend || '—'}</td>
                                                <td className="px-4 py-2.5 text-gray-600">{row.maxGuests || '—'}</td>
                                                <td className="px-4 py-2.5 text-gray-600">{row.contactNumber || '—'}</td>
                                                <td className="px-4 py-2.5 text-gray-500 max-w-[200px] truncate">{row.facilities || '—'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={handleSubmit}
                            disabled={loading || validRows.length === 0 || missingCols.length > 0}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Uploading…</>
                            ) : (
                                <><FiSend className="w-4 h-4" />Upload {validRows.length} Farm{validRows.length !== 1 ? 's' : ''}</>
                            )}
                        </button>
                        <button onClick={resetUpload} className="btn-secondary flex items-center gap-2">
                            <FiX className="w-4 h-4" />
                            Choose Different File
                        </button>
                    </div>
                </div>
            )}

            {/* Step: RESULT */}
            {step === 'result' && result && (
                <div className="space-y-6">
                    <div className={`rounded-2xl p-8 text-center border ${result.inserted > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="text-5xl mb-4">{result.inserted > 0 ? '🎉' : '😕'}</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{result.message}</h2>
                        <div className="flex items-center justify-center gap-8 mt-6">
                            <div className="text-center">
                                <p className="text-4xl font-extrabold text-green-600">{result.inserted}</p>
                                <p className="text-sm text-gray-500 mt-1">Farms Created</p>
                            </div>
                            {result.skipped > 0 && (
                                <>
                                    <div className="w-px h-12 bg-gray-200" />
                                    <div className="text-center">
                                        <p className="text-4xl font-extrabold text-orange-500">{result.skipped}</p>
                                        <p className="text-sm text-gray-500 mt-1">Rows Skipped</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {result.errors && result.errors.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                            <p className="font-semibold text-orange-700 text-sm mb-2">Skipped Rows Details:</p>
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                                {result.errors.map((e, i) => (
                                    <div key={i} className="text-xs text-orange-600">
                                        <span className="font-semibold">Row {e.row} ({e.title}):</span> {e.errors.join('; ')}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/admin/dashboard')} className="btn-primary flex items-center gap-2">
                            <FiCheckCircle className="w-4 h-4" />
                            Go to Dashboard
                        </button>
                        <button onClick={resetUpload} className="btn-secondary flex items-center gap-2">
                            <FiUploadCloud className="w-4 h-4" />
                            Upload Another CSV
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulkUploadFarmhouse;
