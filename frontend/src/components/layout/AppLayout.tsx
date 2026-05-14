import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpenCheck, LogOut, LayoutDashboard, Library, FileText, FileClock, PieChart, FileSpreadsheet, Building2, Plus, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCompanies } from '@/api/hooks/useCompanies';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { cn } from '@/lib/utils';
import logoSiaksa from '@/assets/logo-siaksa.png';

export function AppLayout() {
  const { user, activeCompanyId, clearAuth, setActiveCompanyId } = useAuthStore();
  const { companies, isLoading, createCompany } = useCompanies();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyCurrency, setNewCompanyCurrency] = useState('IDR');

  // Auto-select first company if none is selected
  useEffect(() => {
    if (!isLoading && companies.length > 0 && !activeCompanyId) {
      setActiveCompanyId(companies[0].id);
    }
    // Force open create dialog if user has no companies
    if (!isLoading && companies.length === 0 && !isCreateCompanyOpen) {
      setIsCreateCompanyOpen(true);
    }
  }, [companies, isLoading, activeCompanyId, setActiveCompanyId, isCreateCompanyOpen]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    try {
      const company = await createCompany(newCompanyName, newCompanyCurrency);
      setActiveCompanyId(company.id);
      setIsCreateCompanyOpen(false);
      setNewCompanyName('');
      setNewCompanyCurrency('IDR');
    } catch (error) {
      console.error('Failed to create company', error);
    }
  };

  const navSections = [
    {
      label: 'Main',
      links: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/accounts', icon: Library, label: 'Chart of Accounts' },
        { to: '/journals', icon: FileText, label: 'General Journal' },
        { to: '/adjusting', icon: FileClock, label: 'Adjusting Entries' },
      ],
    },
    {
      label: 'Reports',
      links: [
        { to: '/ledger', icon: BookOpenCheck, label: 'General Ledger' },
        { to: '/trial-balance', icon: PieChart, label: 'Trial Balance' },
        { to: '/worksheet', icon: FileSpreadsheet, label: 'Worksheet' },
        { to: '/income-statement', icon: PieChart, label: 'Income Statement' },
        { to: '/balance-sheet', icon: BookOpenCheck, label: 'Balance Sheet' },
      ],
    },
    {
      label: 'Settings',
      links: [
        { to: '/settings/company', icon: Settings, label: 'Company Config' },
      ],
    },
  ];

  return (
    <div className="bg-background min-h-screen flex print:block">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card hidden md:flex flex-col shadow-sm print:hidden">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            {/* Bungkus dengan Link dan arahkan ke rute dashboard (biasanya "/") */}
            <Link
              to="/dashboard"
              className="transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md"
            >
              <img
                src={logoSiaksa}
                alt="Logo SIAKSA"
                // Tambahkan cursor-pointer agar mouse berubah menjadi ikon tangan
                className="h-30 w-auto object-contain drop-shadow-sm cursor-pointer"
              />
            </Link>
          </div>
        </div>

        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsCreateCompanyOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
          <Select value={activeCompanyId || ''} onValueChange={setActiveCompanyId}>
            <SelectTrigger className="w-full bg-slate-50 border-border/50 shadow-sm text-sm">
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <nav className="flex-1 p-4 space-y-5 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-1.5">{section.label}</p>
              <div className="space-y-0.5">
                {section.links.map((link) => {
                  const isActive = location.pathname.startsWith(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-slate-50 hover:text-foreground'
                      )}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-3 px-2 truncate">Logged in as {user?.username}</p>
          <Button variant="outline" className="w-full justify-start text-muted-foreground hover:bg-slate-50 shadow-sm border-border/50 rounded-xl" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50 print:h-auto print:min-h-0 print:overflow-visible">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-border/50 bg-card flex items-center justify-between px-4 shrink-0 shadow-sm print:hidden">
          <span className="font-bold text-foreground">SIAKSA</span>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 print:overflow-visible print:p-4">
          <Outlet />
        </div>
      </main>

      {/* Create Company Dialog */}
      <Dialog open={isCreateCompanyOpen} onOpenChange={setIsCreateCompanyOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl shadow-lg border-border/50">
          <form onSubmit={handleCreateCompany}>
            <DialogHeader>
              <DialogTitle>Create Company</DialogTitle>
              <DialogDescription>
                Add a new company to manage its accounting data.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Company Name</label>
                <Input
                  id="name"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="e.g. PT Sejahtera"
                  required
                  autoFocus
                  className="rounded-xl border-border/50 shadow-sm focus-visible:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Currency</label>
                <Select value={newCompanyCurrency} onValueChange={setNewCompanyCurrency}>
                  <SelectTrigger className="w-full rounded-xl border-border/50 shadow-sm">
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IDR">IDR - Indonesian Rupiah</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!newCompanyName.trim()} className="rounded-xl shadow-sm">
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
