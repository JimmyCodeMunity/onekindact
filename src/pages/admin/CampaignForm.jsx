import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { campaignApi } from '../../api/index.js';
import { CATEGORIES } from '../../lib/utils.js';
import ImageUploader from '../../components/admin/ImageUploader.jsx';
import toast from 'react-hot-toast';

const STATUSES = ['active', 'urgent', 'completed', 'paused'];

export default function CampaignForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [images, setImages]     = useState([]);
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(isEdit);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '', category: 'Emergency Relief', summary: '', story: '',
      targetAmount: '',
      beneficiary: { name: '', age: '', location: '', situation: '' },
      status: 'active', isFeatured: false, isUrgent: false,
      seo: { metaTitle: '', metaDescription: '', keywords: '' },
    },
  });

  // Load existing campaign on edit
  useEffect(() => {
    if (!isEdit) return;
    campaignApi.getById(id)
      .then(({ data }) => {
        const c = data.campaign;
        reset({
          title:        c.title,
          category:     c.category,
          summary:      c.summary,
          story:        c.story,
          targetAmount: c.targetAmount,
          beneficiary:  c.beneficiary || {},
          status:       c.status,
          isFeatured:   c.isFeatured,
          isUrgent:     c.isUrgent,
          seo: {
            metaTitle:       c.seo?.metaTitle       || '',
            metaDescription: c.seo?.metaDescription || '',
            keywords:        c.seo?.keywords?.join(', ') || '',
          },
        });
        setImages(c.images || []);
      })
      .catch(() => toast.error('Failed to load campaign'))
      .finally(() => setLoading(false));
  }, [id, isEdit, reset]);

  const onSubmit = async (values) => {
    if (images.length === 0) {
      toast.error('Please upload at least one image.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...values,
        targetAmount: Number(values.targetAmount),
        images,
        seo: {
          ...values.seo,
          keywords: values.seo.keywords
            ? values.seo.keywords.split(',').map((k) => k.trim()).filter(Boolean)
            : [],
        },
        beneficiary: {
          ...values.beneficiary,
          age: values.beneficiary.age ? Number(values.beneficiary.age) : undefined,
        },
      };

      if (isEdit) {
        await campaignApi.update(id, payload);
        toast.success('Campaign updated!');
      } else {
        await campaignApi.create(payload);
        toast.success('Campaign created!');
      }
      navigate('/admin/campaigns');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin/campaigns" className="btn-ghost -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-stone-900">
            {isEdit ? 'Edit Campaign' : 'New Campaign'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* ─── Basic Info ─────────────────────────────────────────────── */}
        <section className="card p-6 space-y-4">
          <h2 className="font-semibold text-stone-800 border-b border-stone-100 pb-3">Basic Information</h2>

          <div>
            <label className="label">Campaign Title *</label>
            <input
              {...register('title', { required: 'Title is required', maxLength: { value: 120, message: 'Max 120 characters' } })}
              className="input"
              placeholder="e.g. Help Ahmed — Emergency Surgery Needed"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select {...register('category', { required: true })} className="input">
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Short Summary * <span className="text-stone-400 font-normal">(shown on campaign card)</span></label>
            <textarea
              {...register('summary', { required: 'Summary is required', maxLength: { value: 300, message: 'Max 300 characters' } })}
              rows={2}
              className="input resize-none"
              placeholder="Brief description of the need…"
            />
            {errors.summary && <p className="text-red-500 text-xs mt-1">{errors.summary.message}</p>}
          </div>

          <div>
            <label className="label">Full Story * <span className="text-stone-400 font-normal">(shown on campaign detail page)</span></label>
            <textarea
              {...register('story', { required: 'Story is required' })}
              rows={6}
              className="input resize-y"
              placeholder="Tell the full story — the more detail, the more donors will connect…"
            />
            {errors.story && <p className="text-red-500 text-xs mt-1">{errors.story.message}</p>}
          </div>

          <div>
            <label className="label">Fundraising Goal (USD) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-semibold">$</span>
              <input
                {...register('targetAmount', {
                  required: 'Target amount is required',
                  min: { value: 5, message: 'Minimum $5' },
                })}
                type="number"
                className="input pl-8"
                placeholder="1000"
              />
            </div>
            {errors.targetAmount && <p className="text-red-500 text-xs mt-1">{errors.targetAmount.message}</p>}
          </div>

          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register('isFeatured')} className="w-4 h-4 accent-brand-500" />
              <span className="font-medium text-stone-700">⭐ Featured on homepage</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register('isUrgent')} className="w-4 h-4 accent-red-500" />
              <span className="font-medium text-stone-700">🚨 Mark as Urgent</span>
            </label>
          </div>
        </section>

        {/* ─── Images ─────────────────────────────────────────────────── */}
        <section className="card p-6 space-y-3">
          <h2 className="font-semibold text-stone-800 border-b border-stone-100 pb-3">
            Photos <span className="text-stone-400 font-normal text-sm">(at least 1 required)</span>
          </h2>
          <ImageUploader images={images} onChange={setImages} />
        </section>

        {/* ─── Beneficiary ─────────────────────────────────────────────── */}
        <section className="card p-6 space-y-4">
          <h2 className="font-semibold text-stone-800 border-b border-stone-100 pb-3">Beneficiary Details</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input {...register('beneficiary.name', { required: 'Beneficiary name is required' })} className="input" placeholder="Ahmed Al-Rashid" />
              {errors.beneficiary?.name && <p className="text-red-500 text-xs mt-1">{errors.beneficiary.name.message}</p>}
            </div>
            <div>
              <label className="label">Age</label>
              <input {...register('beneficiary.age')} type="number" className="input" placeholder="32" />
            </div>
          </div>

          <div>
            <label className="label">Location *</label>
            <input {...register('beneficiary.location', { required: 'Location is required' })} className="input" placeholder="e.g. Aleppo, Syria" />
            {errors.beneficiary?.location && <p className="text-red-500 text-xs mt-1">{errors.beneficiary.location.message}</p>}
          </div>

          <div>
            <label className="label">Situation summary</label>
            <textarea {...register('beneficiary.situation')} rows={3} className="input resize-none" placeholder="Describe the beneficiary's current situation…" />
          </div>
        </section>

        {/* ─── SEO ─────────────────────────────────────────────────────── */}
        <section className="card p-6 space-y-4">
          <h2 className="font-semibold text-stone-800 border-b border-stone-100 pb-3">SEO <span className="text-stone-400 font-normal text-sm">(optional — auto-generated if blank)</span></h2>

          <div>
            <label className="label">Meta Title</label>
            <input {...register('seo.metaTitle')} className="input" placeholder="Autogenerated from campaign title" />
          </div>
          <div>
            <label className="label">Meta Description</label>
            <textarea {...register('seo.metaDescription')} rows={2} className="input resize-none" placeholder="Autogenerated from summary…" />
          </div>
          <div>
            <label className="label">Keywords <span className="text-stone-400 font-normal">(comma-separated)</span></label>
            <input {...register('seo.keywords')} className="input" placeholder="donation, medical aid, emergency" />
          </div>
        </section>

        {/* ─── Submit ──────────────────────────────────────────────────── */}
        <div className="flex gap-4 pb-10">
          <Link to="/admin/campaigns" className="btn-secondary flex-1 justify-center">Cancel</Link>
          <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Save Changes' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}
