import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    GraduationCap, Briefcase, LayoutDashboard, Users, Award, LogOut,
    Plus, XCircle, CheckCircle, Clock, Search, Pencil, Trash2,
    BarChart3, TrendingUp, UserCheck, X, Shield, ChevronDown,
    BookOpen, Bell, Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase, type Profile, type Job, type Application } from '../lib/supabase';
import { cn, formatLPA, getInitials, getCompanyColor } from '../lib/utils';
import { Button, Badge, Card, StatCard, Modal, Input, EmptyState, Skeleton, useToast } from '../components/ui';

type AdminView = 'dashboard' | 'jobs' | 'applications' | 'placements' | 'students';

const NAV_ITEMS: { id: AdminView; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'jobs', label: 'Manage Jobs', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'applications', label: 'Applications', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'placements', label: 'Placements', icon: <Award className="w-5 h-5" /> },
    { id: 'students', label: 'Students', icon: <Users className="w-5 h-5" /> },
];

// ── Main AdminApp ────────────────────────────────────────────────────────────

export default function AdminApp({ user, profile, onSignOut }: {
    user: any;
    profile: Profile;
    onSignOut: () => void;
}) {
    const [view, setView] = useState<AdminView>('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [apps, setApps] = useState<Application[]>([]);
    const [students, setStudents] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast, ToastContainer } = useToast();

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        const [j, a, s] = await Promise.all([
            supabase.from('jobs').select('*').order('created_at', { ascending: false }),
            supabase.from('applications').select('*, jobs(*), profiles(*)').order('applied_at', { ascending: false }),
            supabase.from('profiles').select('*').order('full_name'),
        ]);
        if (j.data) setJobs(j.data);
        if (a.data) setApps(a.data);
        if (s.data) setStudents(s.data);
        setLoading(false);
    };

    const placed = apps.filter(a => a.status === 'selected');
    const avgPackage = placed.length > 0
        ? (placed.reduce((sum, a) => sum + (a.jobs?.package_lpa || 0), 0) / placed.length).toFixed(1)
        : '0';

    const stats = {
        totalStudents: students.filter(s => !s.is_admin).length,
        totalJobs: jobs.length,
        totalApps: apps.length,
        placed: placed.length,
        avgPackage,
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <ToastContainer />

            {/* Sidebar Overlay (mobile) */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={cn(
                'admin-sidebar fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300 md:translate-x-0 md:static md:z-auto',
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
                {/* Logo */}
                <div className="px-5 py-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm leading-none">CampusPlacement</p>
                            <p className="text-indigo-300 text-xs mt-0.5">Admin Portal</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setView(item.id); setSidebarOpen(false); }}
                            className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                                view === item.id
                                    ? 'bg-white/20 text-white shadow-inner'
                                    : 'text-indigo-200 hover:text-white hover:bg-white/10'
                            )}
                        >
                            {item.icon}
                            {item.label}
                            {view === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
                        </button>
                    ))}
                </nav>

                {/* Admin Profile */}
                <div className="px-4 py-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                            'w-9 h-9 rounded-xl bg-gradient-to-br text-white flex items-center justify-center text-sm font-bold shrink-0',
                            getCompanyColor(profile.full_name)
                        )}>
                            {getInitials(profile.full_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{profile.full_name}</p>
                            <div className="flex items-center gap-1">
                                <Shield className="w-3 h-3 text-indigo-300" />
                                <p className="text-indigo-300 text-xs">Admin</p>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full text-indigo-200 hover:bg-white/10 hover:text-white" onClick={onSignOut}>
                        <LogOut className="w-4 h-4" /> Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => setSidebarOpen(true)}>
                            <BarChart3 className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 capitalize">{view === 'dashboard' ? 'Admin Dashboard' : NAV_ITEMS.find(n => n.id === view)?.label}</h2>
                            <p className="text-xs text-slate-400 hidden sm:block">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                            <Bell className="w-5 h-5" />
                        </button>
                        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-100">
                            <div className={cn(
                                'w-8 h-8 rounded-lg bg-gradient-to-br text-white flex items-center justify-center text-xs font-bold',
                                getCompanyColor(profile.full_name)
                            )}>
                                {getInitials(profile.full_name)}
                            </div>
                            <p className="text-sm font-medium text-slate-700">{profile.full_name}</p>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 overflow-auto">
                    <AnimatePresence mode="wait">
                        {view === 'dashboard' && (
                            <motion.div key="dash" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <DashboardOverview stats={stats} jobs={jobs} apps={apps} loading={loading} />
                            </motion.div>
                        )}
                        {view === 'jobs' && (
                            <motion.div key="jobs" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <JobsManager jobs={jobs} onRefresh={fetchAll} toast={toast} />
                            </motion.div>
                        )}
                        {view === 'applications' && (
                            <motion.div key="apps" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <ApplicationsManager apps={apps} onRefresh={fetchAll} toast={toast} />
                            </motion.div>
                        )}
                        {view === 'placements' && (
                            <motion.div key="place" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <PlacementsTracker placed={placed} stats={stats} />
                            </motion.div>
                        )}
                        {view === 'students' && (
                            <motion.div key="students" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <StudentsTable students={students} apps={apps} onRefresh={fetchAll} toast={toast} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

// ── Dashboard Overview ───────────────────────────────────────────────────────

function DashboardOverview({ stats, jobs, apps, loading }: {
    stats: any; jobs: Job[]; apps: Application[]; loading: boolean;
}) {
    const recentApps = apps.slice(0, 6);

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Students" value={stats.totalStudents} icon={<Users className="w-5 h-5" />} color="blue" />
                <StatCard label="Jobs Posted" value={stats.totalJobs} icon={<Briefcase className="w-5 h-5" />} color="purple" />
                <StatCard label="Applications" value={stats.totalApps} icon={<LayoutDashboard className="w-5 h-5" />} color="orange" />
                <StatCard label="Students Placed" value={stats.placed} icon={<Award className="w-5 h-5" />} color="green" sub={`Avg ${stats.avgPackage} LPA`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Applications */}
                <Card className="col-span-2 p-5">
                    <h3 className="text-base font-bold text-slate-900 mb-4">Recent Applications</h3>
                    {loading ? (
                        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}</div>
                    ) : recentApps.length === 0 ? (
                        <p className="text-sm text-slate-400">No applications yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {recentApps.map(app => (
                                <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                    <div className={cn(
                                        'w-9 h-9 rounded-lg bg-gradient-to-br text-white shrink-0 flex items-center justify-center text-xs font-bold',
                                        getCompanyColor(app.jobs?.company_name || '')
                                    )}>
                                        {getInitials(app.jobs?.company_name || '?')}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 truncate">{(app.profiles as any)?.full_name}</p>
                                        <p className="text-xs text-slate-500 truncate">{app.jobs?.company_name} · {app.jobs?.role}</p>
                                    </div>
                                    <Badge variant={app.status === 'selected' ? 'success' : app.status === 'rejected' ? 'error' : app.status === 'shortlisted' ? 'warning' : 'info'} size="xs">
                                        {app.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Active Jobs */}
                <Card className="p-5">
                    <h3 className="text-base font-bold text-slate-900 mb-4">Active Jobs</h3>
                    {loading ? (
                        <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-14" />)}</div>
                    ) : jobs.length === 0 ? (
                        <p className="text-sm text-slate-400">No jobs posted.</p>
                    ) : (
                        <div className="space-y-3">
                            {jobs.slice(0, 5).map(job => (
                                <div key={job.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                    <div className={cn(
                                        'w-8 h-8 rounded-lg bg-gradient-to-br text-white shrink-0 flex items-center justify-center text-xs font-bold',
                                        getCompanyColor(job.company_name)
                                    )}>
                                        {getInitials(job.company_name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-slate-900 truncate">{job.company_name}</p>
                                        <p className="text-[11px] text-slate-400">{formatLPA(job.package_lpa)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

// ── Jobs Manager ─────────────────────────────────────────────────────────────

const EMPTY_JOB = {
    company_name: '', role: '', description: '', min_cgpa: 7.0, package_lpa: 6.0,
    deadline: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
};

function JobsManager({ jobs, onRefresh, toast }: { jobs: Job[]; onRefresh: () => void; toast: any }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editJob, setEditJob] = useState<Job | null>(null);
    const [form, setForm] = useState(EMPTY_JOB);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

    const openAdd = () => { setEditJob(null); setForm(EMPTY_JOB); setModalOpen(true); };
    const openEdit = (job: Job) => {
        setEditJob(job);
        setForm({
            company_name: job.company_name, role: job.role, description: job.description,
            min_cgpa: job.min_cgpa, package_lpa: job.package_lpa,
            deadline: format(new Date(job.deadline), "yyyy-MM-dd'T'HH:mm"),
        });
        setModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        if (editJob) {
            const { error } = await supabase.from('jobs').update(form).eq('id', editJob.id);
            if (error) toast(error.message, 'error');
            else { toast('Job updated!', 'success'); setModalOpen(false); onRefresh(); }
        } else {
            const { error } = await supabase.from('jobs').insert(form);
            if (error) toast(error.message, 'error');
            else { toast('Job posted successfully!', 'success'); setModalOpen(false); onRefresh(); }
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this job posting? All applications will also be deleted.')) return;
        const { error } = await supabase.from('jobs').delete().eq('id', id);
        if (error) toast(error.message, 'error');
        else { toast('Job deleted.', 'info'); onRefresh(); }
    };

    const filtered = jobs.filter(j =>
        j.company_name.toLowerCase().includes(search.toLowerCase()) ||
        j.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Job Postings</h2>
                    <p className="text-sm text-slate-500">{jobs.length} total jobs posted</p>
                </div>
                <Button variant="admin" onClick={openAdd}>
                    <Plus className="w-4 h-4" /> Post New Job
                </Button>
            </div>

            <div className="relative mb-4 w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Search jobs..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <Card>
                {filtered.length === 0 ? (
                    <EmptyState icon={<Briefcase className="w-10 h-10" />} title="No jobs posted yet" description="Post your first job to get started." action={
                        <Button variant="admin" onClick={openAdd}><Plus className="w-4 h-4" /> Post Job</Button>
                    } />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {['Company', 'Role', 'Package', 'Min CGPA', 'Deadline', 'Actions'].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(job => (
                                    <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br text-white flex items-center justify-center text-xs font-bold', getCompanyColor(job.company_name))}>
                                                    {getInitials(job.company_name)}
                                                </div>
                                                <span className="font-semibold text-slate-900 text-sm">{job.company_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 text-sm">{job.role}</td>
                                        <td className="px-5 py-4"><Badge variant="info">{formatLPA(job.package_lpa)}</Badge></td>
                                        <td className="px-5 py-4 text-slate-600 text-sm">{job.min_cgpa}</td>
                                        <td className="px-5 py-4 text-slate-500 text-sm whitespace-nowrap">{format(new Date(job.deadline), 'MMM d, yyyy')}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => openEdit(job)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Edit">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(job.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Add/Edit Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editJob ? 'Edit Job' : 'Post New Job'}>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Company Name" required value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} />
                        <Input label="Role / Position" required value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700">Job Description</label>
                        <textarea
                            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Describe the role, responsibilities, requirements..."
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <Input label="Min CGPA" type="number" step="0.1" min="0" max="10" value={form.min_cgpa} onChange={e => setForm({ ...form, min_cgpa: Number(e.target.value) })} />
                        <Input label="Package (LPA)" type="number" step="0.1" value={form.package_lpa} onChange={e => setForm({ ...form, package_lpa: Number(e.target.value) })} />
                        <Input label="Deadline" type="datetime-local" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="submit" variant="admin" className="flex-1" loading={saving}>
                            {editJob ? 'Update Job' : 'Post Job'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

// ── Applications Manager ─────────────────────────────────────────────────────

function ApplicationsManager({ apps, onRefresh, toast }: { apps: Application[]; onRefresh: () => void; toast: any }) {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [updating, setUpdating] = useState<string | null>(null);

    const updateStatus = async (appId: string, status: string) => {
        setUpdating(appId);
        const { error } = await supabase.from('applications').update({ status }).eq('id', appId);
        setUpdating(null);
        if (error) toast(error.message, 'error');
        else { toast(`Status updated to ${status}`, 'success'); onRefresh(); }
    };

    const filtered = apps.filter(a => {
        const name = (a.profiles as any)?.full_name?.toLowerCase() || '';
        const comp = a.jobs?.company_name?.toLowerCase() || '';
        const q = search.toLowerCase();
        const matchSearch = !q || name.includes(q) || comp.includes(q);
        const matchStatus = filterStatus === 'all' || a.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const statusCounts = {
        all: apps.length,
        applied: apps.filter(a => a.status === 'applied').length,
        shortlisted: apps.filter(a => a.status === 'shortlisted').length,
        selected: apps.filter(a => a.status === 'selected').length,
        rejected: apps.filter(a => a.status === 'rejected').length,
    };

    return (
        <>
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Applications</h2>
                <p className="text-sm text-slate-500">{apps.length} total applications</p>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {(['all', 'applied', 'shortlisted', 'selected', 'rejected'] as const).map(s => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                            filterStatus === s
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        )}
                    >
                        {s.charAt(0).toUpperCase() + s.slice(1)} ({statusCounts[s]})
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative mb-4 w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Search by student or company..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <Card>
                {filtered.length === 0 ? (
                    <EmptyState icon={<LayoutDashboard className="w-10 h-10" />} title="No applications found" />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {['Student', 'Company / Role', 'CGPA', 'Applied', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(app => {
                                    const student = app.profiles as any;
                                    return (
                                        <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={cn('w-8 h-8 rounded-full bg-gradient-to-br text-white flex items-center justify-center text-xs font-bold shrink-0', getCompanyColor(student?.full_name || ''))}>
                                                        {getInitials(student?.full_name || '?')}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{student?.full_name}</p>
                                                        <p className="text-xs text-slate-400">{student?.roll_number}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-medium text-slate-900">{app.jobs?.company_name}</p>
                                                <p className="text-xs text-slate-500">{app.jobs?.role}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={cn('text-sm font-semibold', student?.cgpa >= (app.jobs?.min_cgpa || 0) ? 'text-emerald-600' : 'text-red-500')}>
                                                    {student?.cgpa}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-500 text-sm whitespace-nowrap">
                                                {format(new Date(app.applied_at), 'MMM d, yyyy')}
                                            </td>
                                            <td className="px-5 py-4">
                                                <Badge variant={
                                                    app.status === 'selected' ? 'success' : app.status === 'rejected' ? 'error' :
                                                        app.status === 'shortlisted' ? 'warning' : 'info'
                                                }>
                                                    {app.status}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1">
                                                    {app.status !== 'shortlisted' && (
                                                        <button
                                                            disabled={updating === app.id}
                                                            onClick={() => updateStatus(app.id, 'shortlisted')}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
                                                            title="Shortlist"
                                                        >
                                                            <Clock className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {app.status !== 'selected' && (
                                                        <button
                                                            disabled={updating === app.id}
                                                            onClick={() => updateStatus(app.id, 'selected')}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                                                            title="Select / Place"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {app.status !== 'rejected' && (
                                                        <button
                                                            disabled={updating === app.id}
                                                            onClick={() => updateStatus(app.id, 'rejected')}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </>
    );
}

// ── Placements Tracker ───────────────────────────────────────────────────────

function PlacementsTracker({ placed, stats }: { placed: Application[]; stats: any }) {
    return (
        <>
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Placement Tracker</h2>
                <p className="text-sm text-slate-500">Overview of all placed students</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard label="Students Placed" value={stats.placed} icon={<UserCheck className="w-5 h-5" />} color="green" />
                <StatCard label="Avg. Package" value={`${stats.avgPackage} LPA`} icon={<TrendingUp className="w-5 h-5" />} color="blue" />
                <StatCard label="Companies" value={new Set(placed.map(p => p.jobs?.company_name)).size} icon={<Briefcase className="w-5 h-5" />} color="purple" />
            </div>

            {placed.length === 0 ? (
                <Card>
                    <EmptyState icon={<Award className="w-10 h-10" />} title="No placements yet" description="Student placements will appear here once you mark applications as selected." />
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {placed.map((app, i) => {
                        const student = app.profiles as any;
                        return (
                            <motion.div
                                key={app.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="p-5 border-l-4 border-emerald-400">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br text-white flex items-center justify-center text-sm font-bold shrink-0', getCompanyColor(student?.full_name || ''))}>
                                            {getInitials(student?.full_name || '?')}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-900">{student?.full_name}</p>
                                            <p className="text-xs text-slate-500">{student?.roll_number} • {student?.department}</p>
                                        </div>
                                    </div>
                                    <div className={cn('p-3 rounded-xl bg-gradient-to-r text-white', getCompanyColor(app.jobs?.company_name || ''))}>
                                        <p className="font-bold text-sm">{app.jobs?.company_name}</p>
                                        <p className="text-xs opacity-90">{app.jobs?.role} · {formatLPA(app.jobs?.package_lpa || 0)}</p>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">{format(new Date(app.applied_at), 'MMM d, yyyy')}</p>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </>
    );
}

// ── Students Table ───────────────────────────────────────────────────────────

function StudentsTable({ students, apps, onRefresh, toast }: {
    students: Profile[];
    apps: Application[];
    onRefresh: () => void;
    toast: any;
}) {
    const [search, setSearch] = useState('');
    const [toggling, setToggling] = useState<string | null>(null);

    const placed = new Set(apps.filter(a => a.status === 'selected').map(a => a.student_id));

    const filtered = students.filter(s =>
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.roll_number.toLowerCase().includes(search.toLowerCase()) ||
        (s.department || '').toLowerCase().includes(search.toLowerCase())
    );

    const toggleAdmin = async (userId: string, current: boolean) => {
        if (current && !confirm('Remove admin privileges from this user?')) return;
        setToggling(userId);
        const { error } = await supabase.from('profiles').update({ is_admin: !current }).eq('id', userId);
        setToggling(null);
        if (error) toast(error.message, 'error');
        else { toast(current ? 'Admin revoked.' : 'Admin granted!', 'success'); onRefresh(); }
    };

    const studentList = filtered.filter(s => !s.is_admin);
    const adminList = filtered.filter(s => s.is_admin);

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Students & Users</h2>
                    <p className="text-sm text-slate-500">{studentList.length} students · {adminList.length} admins</p>
                </div>
            </div>

            <div className="relative mb-4 w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Search by name, roll or department..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <Card>
                {filtered.length === 0 ? (
                    <EmptyState icon={<Users className="w-10 h-10" />} title="No users found" />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {['Student', 'Roll No', 'Department', 'CGPA', 'Placement', 'Role', 'Actions'].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(student => (
                                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className={cn('w-8 h-8 rounded-full bg-gradient-to-br text-white flex items-center justify-center text-xs font-bold shrink-0', getCompanyColor(student.full_name))}>
                                                    {getInitials(student.full_name)}
                                                </div>
                                                <p className="text-sm font-semibold text-slate-900">{student.full_name}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 text-sm">{student.roll_number}</td>
                                        <td className="px-5 py-4 text-slate-600 text-sm">{student.department || '—'}</td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-semibold text-slate-700">{student.cgpa || '—'}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {placed.has(student.id)
                                                ? <Badge variant="success">Placed</Badge>
                                                : <Badge variant="default">Active</Badge>
                                            }
                                        </td>
                                        <td className="px-5 py-4">
                                            <Badge variant={student.is_admin ? 'purple' : 'default'}>
                                                {student.is_admin ? 'Admin' : 'Student'}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-4">
                                            <button
                                                disabled={toggling === student.id}
                                                onClick={() => toggleAdmin(student.id, student.is_admin)}
                                                className={cn(
                                                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50',
                                                    student.is_admin
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                                )}
                                            >
                                                {student.is_admin ? 'Revoke Admin' : 'Make Admin'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </>
    );
}
