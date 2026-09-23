import React, { useState, useRef } from 'react';
import { GalleryPhoto } from '../types';
import { templeStore } from '../services/store';
import { processImageFile } from '../utils/imageUtils';
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Camera,
  Layers,
  Upload,
  CheckCircle2,
} from 'lucide-react';

interface GalleryManagerProps {
  role?: 'admin' | 'staff';
  staffName?: string;
  onRefresh?: () => void;
}

// Preset quality temple images for quick insertion
const SAMPLE_PRESETS = [
  {
    title: 'माँ जगदम्बा स्वर्ण श्रृंगार',
    caption: 'अलौकिक स्वर्ण मुकुट एवं पुष्पों से सुसज्जित माँ जगदम्बा',
    url: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'अखंड ज्योति एवं सांध्य आरती',
    caption: 'मथुरापुर धाम में जलती अखंड ज्योति एवं सांध्य दीप महाआरती',
    url: 'https://images.unsplash.com/photo-1609743522653-52354461eb27?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'नवरात्र शतचंडी महायज्ञ',
    caption: 'वैदिक मंत्रोच्चार के साथ संपन्न होता पावन शतचंडी महायज्ञ',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'महाप्रसाद एवं जन भंडारा सेवा',
    caption: 'श्रद्धालुओं एवं भक्तों हेतु अनवरत चल रही शुद्ध प्रसाद सेवा',
    url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'पावन मंदिर शिखर दर्शन',
    caption: 'मथुरापुर शक्तिपीठ का भव्य व अलौकिक मंदिर शिखर',
    url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'दीपावली दीपोत्सव',
    caption: 'हजारों दीपकों से जगमगाता माँ जगदम्बा का पावन धाम',
    url: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80',
  },
];

export const GalleryManager: React.FC<GalleryManagerProps> = ({
  role = 'admin',
  staffName,
  onRefresh,
}) => {
  const config = templeStore.getConfig();
  const photos = config.galleryPhotos || [];

  // Local re-render tick
  const [, setTick] = useState(0);
  const rerender = () => {
    setTick((t) => t + 1);
    if (onRefresh) onRefresh();
  };

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isProcessingNewFile, setIsProcessingNewFile] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  // Edit modal state
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editError, setEditError] = useState('');
  const [isProcessingEditFile, setIsProcessingEditFile] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Preview full size
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null);

  // Handle direct file upload for new photo
  const handleNewFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingNewFile(true);
    setFormError('');
    try {
      const base64Data = await processImageFile(file, 960, 0.82);
      setNewUrl(base64Data);

      // Auto-suggest title if blank based on file name
      if (!newTitle.trim()) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .trim();
        if (cleanName && cleanName.length > 2) {
          setNewTitle(cleanName);
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'फोटो प्रोसेस करने में समस्या आई।');
    } finally {
      setIsProcessingNewFile(false);
      if (addFileInputRef.current) addFileInputRef.current.value = '';
    }
  };

  // Handle direct file upload for editing photo
  const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingEditFile(true);
    setEditError('');
    try {
      const base64Data = await processImageFile(file, 960, 0.82);
      setEditUrl(base64Data);
    } catch (err: any) {
      setEditError(err.message || 'फोटो प्रोसेस करने में समस्या आई।');
    } finally {
      setIsProcessingEditFile(false);
      if (editFileInputRef.current) editFileInputRef.current.value = '';
    }
  };

  // Handle Add Photo
  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!newUrl.trim()) {
      setFormError('कृपया पहले फोटो अपलोड करें या चुनें।');
      return;
    }
    if (!newTitle.trim()) {
      setFormError('कृपया फोटो का शीर्षक (Title) दर्ज करें।');
      return;
    }

    try {
      templeStore.addGalleryPhoto({
        url: newUrl.trim(),
        title: newTitle.trim(),
        caption: newCaption.trim() || undefined,
      });

      // Log action
      const userDesc = role === 'admin' ? 'Super Admin' : `Staff (${staffName || 'Staff'})`;
      templeStore.logAction(
        'GALLERY_PHOTO_ADDED',
        `नई फोटो जोड़ी गई: "${newTitle.trim()}" by ${userDesc}`,
        userDesc
      );

      setFormSuccess('फोटो सफलतापूर्वक गैलरी में जोड़ दी गई है!');
      setNewTitle('');
      setNewCaption('');
      setNewUrl('');
      setShowAddForm(false);
      rerender();

      setTimeout(() => setFormSuccess(''), 4000);
    } catch {
      setFormError('फोटो जोड़ने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    }
  };

  // Open Edit Modal
  const startEdit = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setEditTitle(photo.title);
    setEditCaption(photo.caption || '');
    setEditUrl(photo.url);
    setEditError('');
  };

  // Save Edit Photo
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;

    if (!editUrl.trim()) {
      setEditError('कृपया फोटो अपलोड करें या फोटो लिंक दर्ज करें।');
      return;
    }
    if (!editTitle.trim()) {
      setEditError('कृपया फोटो का शीर्षक दर्ज करें।');
      return;
    }

    try {
      templeStore.updateGalleryPhoto(editingPhoto.id, {
        url: editUrl.trim(),
        title: editTitle.trim(),
        caption: editCaption.trim() || undefined,
      });

      const userDesc = role === 'admin' ? 'Super Admin' : `Staff (${staffName || 'Staff'})`;
      templeStore.logAction(
        'GALLERY_PHOTO_UPDATED',
        `फोटो अपडेट की गई: "${editTitle.trim()}" by ${userDesc}`,
        userDesc
      );

      setEditingPhoto(null);
      setFormSuccess('फोटो सफलतापूर्वक अपडेट कर दी गई!');
      rerender();
      setTimeout(() => setFormSuccess(''), 4000);
    } catch {
      setEditError('अपडेट करने में समस्या आई।');
    }
  };

  // Handle Delete Photo
  const handleDeletePhoto = (photo: GalleryPhoto) => {
    if (confirm(`क्या आप फोटो "${photo.title}" को गैलरी से हटाना चाहते हैं?`)) {
      templeStore.deleteGalleryPhoto(photo.id);

      const userDesc = role === 'admin' ? 'Super Admin' : `Staff (${staffName || 'Staff'})`;
      templeStore.logAction(
        'GALLERY_PHOTO_DELETED',
        `फोटो हटाई गई: "${photo.title}" by ${userDesc}`,
        userDesc
      );

      setFormSuccess('फोटो हटा दी गई है।');
      rerender();
      setTimeout(() => setFormSuccess(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7a0000] to-[#990000] text-[#FFD700] flex items-center justify-center shadow-md">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold font-heading text-stone-900">
                फोटो गैलरी संपादन (Gallery Photo Manager)
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-[#7a0000] border border-amber-300">
                {photos.length} पावन फोटो
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {role === 'admin'
                ? 'एडमिन व स्टाफ दोनों गैलरी में नई फोटो जोड़ सकते हैं और पुरानी फोटो संपादित कर सकते हैं।'
                : 'स्टाफ पोर्टल: मंदिर की नई पावन तस्वीरें जोड़ें या पुरानी तस्वीरों का विवरण अपडेट करें।'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setFormError('');
          }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition ${
            showAddForm
              ? 'bg-stone-200 hover:bg-stone-300 text-stone-800'
              : 'bg-[#7a0000] hover:bg-[#990000] text-[#FFD700]'
          }`}
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4" />
              <span>फॉर्म बंद करें</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>+ नई फोटो जोड़ें (Add Photo)</span>
            </>
          )}
        </button>
      </div>

      {/* Success Notification */}
      {formSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* ADD NEW PHOTO FORM */}
      {showAddForm && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-[#FFD700] space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-base sm:text-lg font-bold font-heading text-stone-900">
                गैलरी में नई तस्वीर जोड़ें
              </h3>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleAddPhoto} className="space-y-4">
            {/* Hidden file input for adding new photo */}
            <input
              ref={addFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleNewFileChange}
            />

            {/* Direct Upload Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                फोटो अपलोड करें (Upload Photo) <span className="text-red-600">*</span>
              </label>

              {newUrl ? (
                <div className="border-2 border-emerald-400 bg-emerald-50/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group shrink-0">
                    <img
                      src={newUrl}
                      alt="Uploaded preview"
                      className="w-36 h-24 object-cover rounded-xl border-2 border-emerald-400 shadow-md"
                    />
                    <div className="absolute top-1 right-1 p-1 bg-emerald-600 text-white rounded-full shadow">
                      <Check className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-emerald-800 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>फोटो सफलतापूर्वक लोड हो गई है</span>
                    </div>
                    <p className="text-stone-500 text-xs">
                      यह फोटो बिना किसी बाहरी URL के सीधे आपके डिवाइस से गैलरी में जुड़ेगी।
                    </p>
                    <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => addFileInputRef.current?.click()}
                        disabled={isProcessingNewFile}
                        className="px-3.5 py-1.5 rounded-xl bg-[#7a0000] hover:bg-[#990000] text-[#FFD700] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>दूसरी फोटो चुनें (Change Photo)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewUrl('')}
                        className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-red-100 text-stone-700 hover:text-red-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>हटाएं</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => addFileInputRef.current?.click()}
                  className="border-2 border-dashed border-amber-400 hover:border-[#7a0000] bg-amber-50/50 hover:bg-amber-100/60 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2.5 group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-amber-200/90 group-hover:bg-[#7a0000] text-[#7a0000] group-hover:text-[#FFD700] flex items-center justify-center transition shadow-sm">
                    {isProcessingNewFile ? (
                      <div className="w-7 h-7 border-3 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-[#7a0000]">
                      {isProcessingNewFile
                        ? 'फोटो प्रोसेस हो रही है...'
                        : '📷 मोबाइल गैलरी या कैमरा से फोटो अपलोड करें'}
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      बिना किसी URL के सीधे अपने फोन या कंप्यूटर से फोटो जोड़ें (JPG, PNG, WEBP)
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-1 px-5 py-2 rounded-xl bg-[#7a0000] text-[#FFD700] text-xs font-bold shadow pointer-events-none"
                  >
                    + फोटो चुनें (Upload Photo)
                  </button>
                </div>
              )}

              {/* Optional URL Toggle */}
              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 px-1">
                <span>डिवाइस से सीधे फोटो अपलोड समर्थित है</span>
                <button
                  type="button"
                  onClick={() => setShowUrlFallback(!showUrlFallback)}
                  className="text-stone-600 hover:text-[#7a0000] underline font-medium cursor-pointer"
                >
                  {showUrlFallback ? 'URL बॉक्स बंद करें' : 'या वेब URL लिंक दर्ज करें'}
                </button>
              </div>

              {showUrlFallback && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 animate-in fade-in space-y-1">
                  <label className="text-[11px] font-bold text-stone-700">
                    वेब फोटो लिंक (External Image URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs font-mono focus:ring-1 focus:ring-[#7a0000] outline-hidden"
                  />
                </div>
              )}
            </div>

            {/* Title & Caption */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  फोटो का शीर्षक (Title) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: माँ का पावन गर्भगृह, संध्या महाआरती..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#7a0000] outline-hidden font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  विवरण / उपशीर्षक (Caption - वैकल्पिक)
                </label>
                <input
                  type="text"
                  placeholder="उदा: चैत्र नवरात्र के अवसर पर आयोजित विशेष पूजा व दीपदान..."
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#7a0000] outline-hidden"
                />
              </div>
            </div>

            {/* Quick Sample Presets */}
            <div className="pt-2">
              <div className="text-xs font-bold text-stone-600 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>त्वरित नमूना तस्वीरें (Quick Presets - क्लिक करें):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setNewTitle(preset.title);
                      setNewCaption(preset.caption);
                      setNewUrl(preset.url);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#7a0000] border border-amber-200 text-xs font-medium cursor-pointer transition"
                  >
                    + {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-3 flex items-center gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#7a0000] hover:bg-[#990000] text-[#FFD700] text-xs sm:text-sm font-bold shadow-md cursor-pointer transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>गैलरी में सहेजें (Save Photo)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
              >
                रद्द करें
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PHOTOS GRID */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-stone-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-heading text-stone-900">
              वर्तमान गैलरी चित्र सूची (All Active Gallery Photos)
            </h3>
            <p className="text-xs text-stone-500">
              यहाँ से किसी भी फोटो का शीर्षक, विवरण या लिंक संपादित कर सकते हैं अथवा हटा सकते हैं।
            </p>
          </div>
          <span className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
            कुल: {photos.length} फोटो
          </span>
        </div>

        {photos.length === 0 ? (
          <div className="py-12 text-center text-stone-400 space-y-2">
            <ImageIcon className="w-12 h-12 mx-auto stroke-1" />
            <p className="text-sm">गैलरी में अभी कोई फोटो नहीं है।</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-[#7a0000] text-[#FFD700] text-xs font-bold"
            >
              पहली फोटो जोड़ें
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                {/* Photo Thumbnail */}
                <div className="relative aspect-[4/3] bg-stone-900 overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Overlay Action Buttons */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewPhoto(photo)}
                      className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white backdrop-blur-xs cursor-pointer transition shadow"
                      title="बड़ा करके देखें"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(photo)}
                      className="p-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-700 text-white backdrop-blur-xs cursor-pointer transition shadow"
                      title="संपादित करें"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo)}
                      className="p-1.5 rounded-lg bg-red-600/90 hover:bg-red-700 text-white backdrop-blur-xs cursor-pointer transition shadow"
                      title="हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm font-heading line-clamp-1">
                      {photo.title}
                    </h4>
                    {photo.caption ? (
                      <p className="text-stone-600 text-xs mt-1 line-clamp-2 leading-relaxed">
                        {photo.caption}
                      </p>
                    ) : (
                      <p className="text-stone-400 text-xs italic mt-1">कोई विवरण नहीं</p>
                    )}
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="mt-3 pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => startEdit(photo)}
                      className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit (संपादित करें)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo)}
                      className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT PHOTO MODAL */}
      {editingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-4 border-[#FFD700] overflow-hidden my-auto animate-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-[#7a0000] to-[#990000] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#FFD700]" />
                <h3 className="text-base font-bold font-heading text-[#FFD700]">
                  फोटो विवरण संपादित करें
                </h3>
              </div>
              <button
                onClick={() => setEditingPhoto(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Photo Preview and Direct Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  फोटो बदलें / अपलोड करें (Upload Photo) <span className="text-red-600">*</span>
                </label>

                {/* Hidden file input for editing */}
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleEditFileChange}
                />

                <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <img
                    src={editUrl}
                    alt="Preview"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/300x200?text=Invalid+Image';
                    }}
                    className="w-24 h-20 object-cover rounded-xl border border-stone-300 shrink-0 shadow-xs"
                  />
                  <div className="flex-1 space-y-2 w-full">
                    <button
                      type="button"
                      disabled={isProcessingEditFile}
                      onClick={() => editFileInputRef.current?.click()}
                      className="w-full px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-[#7a0000] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>
                        {isProcessingEditFile
                          ? 'फोटो प्रोसेस हो रही है...'
                          : '📷 सीधे नई फोटो अपलोड करें (बिना URL)'}
                      </span>
                    </button>
                    <input
                      type="text"
                      placeholder="या इमेज URL लिंक दर्ज करें (वैकल्पिक)"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-[11px] font-mono focus:ring-1 focus:ring-[#7a0000] outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  शीर्षक (Title) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#7a0000] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  विवरण / उपशीर्षक (Caption)
                </label>
                <textarea
                  rows={2}
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#7a0000] outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#7a0000] hover:bg-[#990000] text-[#FFD700] text-xs font-bold shadow cursor-pointer transition flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  <span>अपडेट सहेजें (Save Changes)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL PHOTO LIGHTBOX PREVIEW */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full bg-stone-900 rounded-3xl overflow-hidden border-2 border-[#FFD700] shadow-2xl relative"
          >
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewPhoto.url}
              alt={previewPhoto.title}
              className="w-full max-h-[70vh] object-contain bg-black"
            />
            <div className="p-4 bg-stone-950 text-white">
              <h3 className="text-lg font-bold font-heading text-[#FFD700]">
                {previewPhoto.title}
              </h3>
              {previewPhoto.caption && (
                <p className="text-xs text-stone-300 mt-1">{previewPhoto.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
