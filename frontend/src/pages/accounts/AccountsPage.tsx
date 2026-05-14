import { useState } from 'react';
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from '@/api/hooks/useAccounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2 } from 'lucide-react';

const CATEGORY_PREFIXES: Record<string, string> = {
  Assets: '1', Liabilities: '2', Equity: '3', Revenue: '4', Expenses: '5'
};

const DEFAULT_NORMAL_BALANCE: Record<string, string> = {
  Assets: 'Debit',
  Liabilities: 'Credit',
  Equity: 'Credit',
  Revenue: 'Credit',
  Expenses: 'Debit'
};

export function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts();
  const { mutate: createAcc } = useCreateAccount();
  const { mutate: updateAcc } = useUpdateAccount();
  const { mutate: deleteAcc } = useDeleteAccount();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteData, setDeleteData] = useState<{id: string, name: string} | null>(null);
  const [formData, setFormData] = useState({ account_code: '', account_name: '', category: 'Assets', normal_balance: 'Debit' });

  const resetForm = () => {
    setEditingId(null);
    setFormData({ account_code: '', account_name: '', category: 'Assets', normal_balance: 'Debit' });
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (acc: any) => {
    setEditingId(acc.id);
    setFormData({
      account_code: acc.account_code,
      account_name: acc.account_name,
      category: acc.category,
      normal_balance: acc.normal_balance
    });
    setIsOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const prefix = CATEGORY_PREFIXES[formData.category];
    const code = formData.account_code.startsWith(prefix) ? formData.account_code : prefix + formData.account_code;

    if (editingId) {
      updateAcc({ id: editingId, data: { account_name: formData.account_name, category: formData.category as any, normal_balance: formData.normal_balance as any } }, {
        onSuccess: () => setIsOpen(false)
      });
    } else {
      createAcc({ ...formData, account_code: code, category: formData.category as any, normal_balance: formData.normal_balance as any }, {
        onSuccess: () => setIsOpen(false)
      });
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Chart of Accounts</h1>
          <p className="text-muted-foreground mt-1">Manage your master accounting records.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl shadow-sm" onClick={handleOpenCreate}>
              <Plus className="w-4 h-4" /> Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl border-border/50">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Account' : 'Create New Account'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => {
                    const autoBalance = DEFAULT_NORMAL_BALANCE[v];
                    if (editingId) {
                      setFormData({ ...formData, category: v });
                    } else {
                      setFormData({
                        ...formData,
                        category: v,
                        account_code: CATEGORY_PREFIXES[v],
                        normal_balance: autoBalance
                      });
                    }
                  }}
                  disabled={!!editingId}
                >
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(CATEGORY_PREFIXES).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                {editingId && <p className="text-xs text-muted-foreground">Category cannot be changed after creation.</p>}
              </div>
              <div className="space-y-2">
                <Label>Account Code</Label>
                <Input
                  className="rounded-xl"
                  // Value langsung mengambil dari state secara utuh (misal: "111")
                  value={formData.account_code}
                  onChange={(e) => {
                    const val = e.target.value;
                    const prefix = editingId
                      ? formData.account_code[0]
                      : CATEGORY_PREFIXES[formData.category];

                    // 1. Cek apakah ketikan user masih memiliki prefix yang benar
                    if (val.startsWith(prefix)) {
                      // 2. Opsional tapi sangat disarankan: Blokir huruf/simbol, hanya izinkan angka
                      const onlyNumbers = val.replace(/[^0-9]/g, '');
                      setFormData({ ...formData, account_code: onlyNumbers });
                    }
                    // 3. Jika user menekan backspace sampai prefix-nya mau hilang, tahan state-nya di prefix
                    else if (val.length < prefix.length) {
                      setFormData({ ...formData, account_code: prefix });
                    }
                  }}
                  // Placeholder menjadi lebih natural, menyesuaikan kategori (misal: "111" atau "211")
                  placeholder={`${editingId ? formData.account_code[0] : CATEGORY_PREFIXES[formData.category]}11`}
                  required
                  disabled={!!editingId}
                />
                {editingId && (
                  <p className="text-xs text-muted-foreground">
                    Account code cannot be changed after creation.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input className="rounded-xl" value={formData.account_name} onChange={(e) => setFormData({ ...formData, account_name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Normal Balance</Label>
                <Select value={formData.normal_balance} onValueChange={(v) => setFormData({ ...formData, normal_balance: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select balance" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Debit">Debit</SelectItem>
                    <SelectItem value="Credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full rounded-xl mt-2">{editingId ? 'Save Changes' : 'Save Account'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="soft-card p-1 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="pl-4">Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead className="text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading accounts...</TableCell></TableRow>
            ) : accounts?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No accounts found.</TableCell></TableRow>
            ) : (
              accounts?.map((acc) => (
                <TableRow key={acc.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium pl-4">{acc.account_code}</TableCell>
                  <TableCell>{acc.account_name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      {acc.category}
                    </span>
                  </TableCell>
                  <TableCell>{acc.normal_balance}</TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(acc)} className="text-muted-foreground hover:text-foreground">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setDeleteData({ id: acc.id, name: acc.account_name });
                      }} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteData} onOpenChange={(open) => !open && setDeleteData(null)}>
        <AlertDialogContent className="rounded-2xl border-border/40 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-slate-900">"{deleteData?.name}"</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-border/50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm"
              onClick={() => {
                if (deleteData) {
                  deleteAcc(deleteData.id);
                  setDeleteData(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
