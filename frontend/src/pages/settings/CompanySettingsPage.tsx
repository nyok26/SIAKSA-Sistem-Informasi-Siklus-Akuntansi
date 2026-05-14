import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Save, Trash2, AlertTriangle, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useCompanies } from '@/api/hooks/useCompanies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

export function CompanySettingsPage() {
  const { activeCompanyId, setActiveCompanyId } = useAuthStore();
  const { companies, updateCompany, deleteCompany, isLoading } = useCompanies();
  const navigate = useNavigate();

  const activeCompany = companies.find((c) => c.id === activeCompanyId);

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('IDR');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (activeCompany) {
      setName(activeCompany.name);
      setCurrency(activeCompany.currency || 'IDR');
    }
  }, [activeCompany]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!activeCompany) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <Building2 className="w-10 h-10 mb-3 text-slate-300" />
        <p className="font-medium">No company selected.</p>
        <p className="text-sm mt-1">Select a company from the sidebar to manage its settings.</p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (trimmed === activeCompany.name && currency === (activeCompany.currency || 'IDR')) return;
    setIsSaving(true);
    try {
      await updateCompany(activeCompany.id, trimmed, currency);
      toast.success('Company name updated successfully.');
    } catch {
      toast.error('Failed to update company name.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCompany(activeCompany.id);
      // Switch to another company if available, else clear
      const remaining = companies.filter((c) => c.id !== activeCompany.id);
      if (remaining.length > 0) {
        setActiveCompanyId(remaining[0].id);
      } else {
        setActiveCompanyId('');
      }
      toast.success(`"${activeCompany.name}" has been permanently deleted.`);
      navigate('/dashboard');
    } catch {
      toast.error('Failed to delete company.');
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  const canDelete = deleteConfirmText === activeCompany.name;

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 bg-slate-100 rounded-xl border border-border/40">
            <Building2 className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Company Settings</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage configuration for <span className="font-semibold text-slate-700">{activeCompany.name}</span></p>
          </div>
        </div>
      </motion.div>

      {/* General Info Card */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
        <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border/40 bg-slate-50/50">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">General Information</h2>
          </div>
          <form onSubmit={handleSave} className="p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="company-name" className="text-sm font-medium text-slate-700">
                Company Name
              </Label>
              <Input
                id="company-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. PT Sejahtera Abadi"
                className="rounded-xl border-border/50 bg-slate-50 shadow-sm focus-visible:ring-primary/20"
                required
              />
              <p className="text-xs text-slate-400">This name appears throughout the app and on all financial reports.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="rounded-xl border-border/50 bg-slate-50 shadow-sm focus-visible:ring-primary/20">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">IDR - Indonesian Rupiah</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-400">All financial reports and journal entries will be formatted in this currency.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Company ID</Label>
              <div className="px-3 py-2 rounded-xl bg-slate-100 border border-border/40 font-mono text-xs text-slate-500 select-all">
                {activeCompany.id}
              </div>
              <p className="text-xs text-slate-400">Read-only unique identifier for this company.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Created On</Label>
              <div className="px-3 py-2 rounded-xl bg-slate-100 border border-border/40 text-sm text-slate-600">
                {new Date(activeCompany.createdAt).toLocaleDateString('id-ID', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isSaving || !name.trim() || (name.trim() === activeCompany.name && currency === (activeCompany.currency || 'IDR'))}
                className="rounded-xl shadow-sm gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Danger Zone Card */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
        <div className="bg-white rounded-2xl border border-rose-200/70 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-rose-200/70 bg-rose-50/50">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h2 className="text-sm font-semibold text-rose-700 uppercase tracking-wider">Danger Zone</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="font-semibold text-slate-800 text-sm">Delete this company</p>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                  Permanently deletes <span className="font-bold text-slate-700">"{activeCompany.name}"</span> along with
                  all its accounts, journal entries, and adjusting entries. <span className="text-rose-600 font-semibold">This action cannot be undone.</span>
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => { setDeleteConfirmText(''); setIsDeleteOpen(true); }}
                className="shrink-0 rounded-xl border-rose-300 text-rose-600 hover:bg-rose-50 hover:border-rose-400 shadow-sm gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Company
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={(open) => { if (!isDeleting) setIsDeleteOpen(open); }}>
        <DialogContent className="sm:max-w-md rounded-2xl shadow-xl border-border/40">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <DialogTitle className="text-slate-900">Delete Company</DialogTitle>
            </div>
            <DialogDescription className="text-slate-500 leading-relaxed">
              This will <span className="font-semibold text-rose-600">permanently delete</span> all data associated with{' '}
              <span className="font-bold text-slate-800">"{activeCompany.name}"</span>:{' '}
              all accounts, journal entries, and adjusting entries will be lost forever.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="confirm-delete" className="text-sm font-medium text-slate-700">
              Type <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{activeCompany.name}</span> to confirm:
            </Label>
            <Input
              id="confirm-delete"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={activeCompany.name}
              className="rounded-xl border-border/50 bg-slate-50 focus-visible:ring-rose-300"
              autoComplete="off"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
              className="rounded-xl border-border/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={!canDelete || isDeleting}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm gap-2"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
