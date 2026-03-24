import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    GraduationCap, Briefcase, LayoutDashboard, User as UserIcon,
    LogOut, Search, MapPin, Clock, ChevronRight, Star, TrendingUp,
    CheckCircle, XCircle, AlertCircle, BookOpen, Award, Bell
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase, type Profile, type Job, type Application } from '../lib/supabase';
import { cn, formatLPA, getInitials, getDeadlineLabel, getCompanyColor, getStatusColor } from '../lib/utils';
import { Button, Badge, Card, Input, Modal, EmptyState, Skeleton, useToast } from '../components/ui';

type View = 'jobs' | 'applications' | 'profile';

const tabs: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'jobs', label: 'Jobs', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'applications', label: 'Applications', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'profile', label: 'My Profile', icon: <UserIcon className="w-4 h-4" /> },
];

// ── Main StudentApp ──────────────────────────────────────────────────────────

export default function StudentApp({ user, profile, onSignOut, onProfileUpdate }: {
    user: any;
    profile: Profile;
    onSignOut: () => void;
    onProfileUpdate: () => void;
}) {
    const [view, setView] = useState<View>('jobs');
    const [appCount, setAppCount] = useState(0);
    const { toast, ToastContainer } = useToast();

    useEffect(() => {
        supabase.from('applications').select('*', { count: 'exact', head: true })
            .eq('student_id', profile.id)
            .then(({ count }) => setAppCount(count || 0));
    }, [profile.id]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <ToastContainer />

            {/* Top Nav */}
            <header className="student-nav sticky top-0 z-30 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-white/10 rounded-xl">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <span className="text-white font-bold text-base leading-none">CampusPlacement</span>
                                <p className="text-blue-200 text-xs">Student Portal</p>
                            </div>
                        </div>

                        {/* Nav Tabs */}
                        <nav className="hidden md:flex items-center gap-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setView(tab.id)}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative',
                                        view === tab.id
                                            ? 'bg-white/20 text-white shadow-inner'
                                            : 'text-blue-200 hover:text-white hover:bg-white/10'
                                    )}
                                >
                                    {tab.icon}
                                    {tab.label}
                                    {tab.id === 'applications' && appCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-amber-400 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                            {appCount > 9 ? '9+' : appCount}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>

                        {/* User */}
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2.5">
                                <div className={cn(
                                    'w-8 h-8 rounded-full bg-gradient-to-br text-white flex items-center justify-center text-xs font-bold shrink-0',
                                    getCompanyColor(profile.full_name)
                                )}>
                                    {getInitials(profile.full_name)}
                                </div>
                                <div className="text-right">
                                    <p className="text-white text-sm font-medium leading-none">{profile.full_name}</p>
                                    <p className="text-blue-300 text-xs mt-0.5">{profile.roll_number}</p>
                                </div>
                            </div>
                            <button
                                onClick={onSignOut}
                                className="p-2 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
                                title="Sign out"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile nav */}
                    <div className="flex md:hidden gap-1 pb-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setView(tab.id)}
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors relative',
                                    view === tab.id ? 'bg-white/20 text-white' : 'text-blue-200 hover:text-white'
                                )}
                            >
                                {tab.icon}
                                {tab.label}
                                {tab.id === 'applications' && appCount > 0 && (
                                    <span className="absolute top-1 right-2 bg-amber-400 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                                        {appCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence mode="wait">
                    {view === 'jobs' && (
                        <motion.div key="jobs" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                            <JobsBrowse profile={profile} toast={toast} onApplicationSubmit={() => setAppCount(c => c + 1)} />
                        </motion.div>
                    )}
                    {view === 'applications' && (
                        <motion.div key="apps" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                            <MyApplications profile={profile} />
                        </motion.div>
                    )}
                    {view === 'profile' && (
                        <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                            <StudentProfile profile={profile} onUpdate={onProfileUpdate} toast={toast} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

// ── Jobs Browse ──────────────────────────────────────────────────────────────

function JobsBrowse({ profile, toast, onApplicationSubmit }: {
    profile: Profile;
    toast: (msg: string, type?: any) => void;
    onApplicationSubmit: () => void;
}) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
    const [applying, setApplying] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    useEffect(() => {
        fetchJobs();
        fetchApplied();
    }, []);

    const fetchJobs = async () => {
        const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
        setJobs(data || []);
        setLoading(false);
    };

    const fetchApplied = async () => {
        const { data } = await supabase.from('applications').select('job_id').eq('student_id', profile.id);
        setAppliedIds(new Set((data || []).map((a: any) => a.job_id)));
    };

    const handleApply = async (jobId: string) => {
        setApplying(jobId);
        const { error } = await supabase.from('applications').insert({ job_id: jobId, student_id: profile.id, status: 'applied' });
        setApplying(null);
        if (error) {
            toast(error.message === 'duplicate key value violates unique constraint "applications_job_id_student_id_key"'
                ? 'You have already applied for this job.'
                : error.message, 'error');
        } else {
            setAppliedIds(prev => new Set([...prev, jobId]));
            toast('Application submitted successfully! 🎉', 'success');
            onApplicationSubmit();
            setSelectedJob(null);
        }
    };

    const filtered = jobs.filter(j =>
        j.company_name.toLowerCase().includes(search.toLowerCase()) ||
        j.role.toLowerCase().includes(search.toLowerCase())
    );

    const eligible = filtered.filter(j => profile.cgpa >= j.min_cgpa);
    const ineligible = filtered.filter(j => profile.cgpa < j.min_cgpa);

    return (
        <>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Available Placements</h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {eligible.length} eligible job{eligible.length !== 1 ? 's' : ''} for you • CGPA: <span className="font-semibold text-blue-600">{profile.cgpa}</span>
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        placeholder="Search companies or roles..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-52 rounded-2xl" />)}
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={<Briefcase className="w-10 h-10" />}
                    title="No jobs found"
                    description="Try a different search term or check back later."
                />
            ) : (
                <div className="space-y-8">
                    {eligible.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Star className="w-4 h-4 text-amber-500" />
                                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">You're Eligible ({eligible.length})</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {eligible.map((job, i) => (
                                    <JobCard
                                        key={job.id}
                                        job={job}
                                        applied={appliedIds.has(job.id)}
                                        eligible={true}
                                        applying={applying === job.id}
                                        delay={i * 60}
                                        onApply={() => handleApply(job.id)}
                                        onViewDetails={() => setSelectedJob(job)}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {ineligible.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4 text-slate-400" />
                                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Improve CGPA to Apply ({ineligible.length})</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-70">
                                {ineligible.map((job, i) => (
                                    <JobCard
                                        key={job.id}
                                        job={job}
                                        applied={false}
                                        eligible={false}
                                        applying={false}
                                        delay={i * 60}
                                        onApply={() => { }}
                                        onViewDetails={() => setSelectedJob(job)}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}

            {/* Job Detail Modal */}
            <Modal open={!!selectedJob} onClose={() => setSelectedJob(null)} title={selectedJob?.company_name || ''}>
                {selectedJob && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                'w-14 h-14 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center text-xl font-bold shrink-0',
                                getCompanyColor(selectedJob.company_name)
                            )}>
                                {getInitials(selectedJob.company_name)}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{selectedJob.role}</h3>
                                <p className="text-slate-500 text-sm">{selectedJob.company_name}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50 rounded-xl p-3">
                                <p className="text-xs text-blue-500 font-medium">Package</p>
                                <p className="text-lg font-bold text-blue-700">{formatLPA(selectedJob.package_lpa)}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-xs text-slate-500 font-medium">Min CGPA</p>
                                <p className="text-lg font-bold text-slate-700">{selectedJob.min_cgpa}</p>
                            </div>
                        </div>

                        {selectedJob.description && (
                            <div>
                                <p className="text-sm font-semibold text-slate-700 mb-1">About the Role</p>
                                <p className="text-sm text-slate-600 leading-relaxed">{selectedJob.description}</p>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Clock className="w-4 h-4" />
                            <span>{getDeadlineLabel(selectedJob.deadline)}</span>
                        </div>

                        {appliedIds.has(selectedJob.id) ? (
                            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-xl p-3">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">You've already applied for this role</span>
                            </div>
                        ) : profile.cgpa < selectedJob.min_cgpa ? (
                            <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl p-3">
                                <XCircle className="w-5 h-5" />
                                <span className="font-medium">You need CGPA ≥ {selectedJob.min_cgpa} to apply (yours: {profile.cgpa})</span>
                            </div>
                        ) : (
                            <Button
                                className="w-full"
                                loading={applying === selectedJob.id}
                                onClick={() => handleApply(selectedJob.id)}
                            >
                                Apply Now
                            </Button>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
}

function JobCard({ job, applied, eligible, applying, delay, onApply, onViewDetails }: {
    job: Job;
    applied: boolean;
    eligible: boolean;
    applying: boolean;
    delay: number;
    onApply: () => void;
    onViewDetails: () => void;
}) {
    const deadlineLabel = getDeadlineLabel(job.deadline);
    const isClosed = deadlineLabel === 'Closed';

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay / 1000, duration: 0.3 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
        >
            {/* Company header */}
            <div className={cn('h-2 w-full bg-gradient-to-r', getCompanyColor(job.company_name))} />
            <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                    <div className={cn(
                        'w-10 h-10 rounded-xl bg-gradient-to-br text-white flex items-center justify-center text-sm font-bold shrink-0',
                        getCompanyColor(job.company_name)
                    )}>
                        {getInitials(job.company_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 truncate">{job.company_name}</h3>
                        <p className="text-slate-500 text-sm truncate">{job.role}</p>
                    </div>
                    <Badge variant="info" size="xs">{formatLPA(job.package_lpa)}</Badge>
                </div>

                <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                        Min CGPA: <span className="font-semibold text-slate-700">{job.min_cgpa}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span className={isClosed ? 'text-red-500 font-medium' : ''}>{deadlineLabel}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onViewDetails}
                        className="flex-1 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Details
                    </button>
                    {applied ? (
                        <div className="flex-1 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg flex items-center justify-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Applied
                        </div>
                    ) : eligible && !isClosed ? (
                        <Button size="xs" className="flex-1" loading={applying} onClick={onApply}>
                            Apply
                        </Button>
                    ) : (
                        <div className="flex-1 py-1.5 text-xs font-medium text-slate-400 bg-slate-50 rounded-lg flex items-center justify-center">
                            {isClosed ? 'Closed' : 'Ineligible'}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ── My Applications ──────────────────────────────────────────────────────────

const STATUS_STEPS = ['applied', 'shortlisted', 'selected'];

function MyApplications({ profile }: { profile: Profile }) {
    const [apps, setApps] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        const { data } = await supabase
            .from('applications')
            .select('*, jobs(*)')
            .eq('student_id', profile.id)
            .order('applied_at', { ascending: false });
        setApps(data || []);
        setLoading(false);
    };

    const placed = apps.filter(a => a.status === 'selected');
    const active = apps.filter(a => a.status !== 'selected' && a.status !== 'rejected');
    const rejected = apps.filter(a => a.status === 'rejected');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
                    <p className="text-slate-500 text-sm mt-0.5">{apps.length} total applications</p>
                </div>
                {placed.length > 0 && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl">
                        <Award className="w-5 h-5" />
                        <span className="font-semibold text-sm">🎉 Placed at {placed[0].jobs?.company_name}</span>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
            ) : apps.length === 0 ? (
                <EmptyState
                    icon={<LayoutDashboard className="w-10 h-10" />}
                    title="No applications yet"
                    description="Browse the jobs tab and apply to companies you're interested in."
                />
            ) : (
                <div className="space-y-4">
                    {apps.map((app, i) => (
                        <ApplicationCard key={app.id} app={app} delay={i * 60} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ApplicationCard({ app, delay }: { app: Application; delay: number }) {
    const job = app.jobs!;
    const isRejected = app.status === 'rejected';
    const currentStep = STATUS_STEPS.indexOf(app.status);

    return (
        <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay / 1000, duration: 0.3 }}
            className={cn(
                'bg-white rounded-2xl border shadow-sm p-5 transition-all',
                isRejected ? 'border-red-100 opacity-70' : 'border-slate-100'
            )}
        >
            <div className="flex items-start gap-4">
                <div className={cn(
                    'w-12 h-12 rounded-xl bg-gradient-to-br text-white flex items-center justify-center text-sm font-bold shrink-0',
                    getCompanyColor(job.company_name)
                )}>
                    {getInitials(job.company_name)}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="font-bold text-slate-900">{job.company_name}</h3>
                            <p className="text-slate-500 text-sm">{job.role} • {formatLPA(job.package_lpa)}</p>
                        </div>
                        <Badge variant={getStatusColor(app.status) as any}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                    </div>

                    {/* Progress stepper */}
                    {!isRejected && (
                        <div className="mt-4 flex items-center gap-0">
                            {STATUS_STEPS.map((step, i) => {
                                const done = i <= currentStep;
                                const active = i === currentStep;
                                return (
                                    <React.Fragment key={step}>
                                        <div className="flex flex-col items-center">
                                            <div className={cn(
                                                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                                                done
                                                    ? active && step === 'selected'
                                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                                        : done
                                                            ? 'bg-blue-500 border-blue-500 text-white'
                                                            : 'border-slate-200 text-slate-300'
                                                    : 'border-slate-200 text-slate-300'
                                            )}>
                                                {done ? (step === 'selected' ? '✓' : i + 1) : i + 1}
                                            </div>
                                            <span className={cn(
                                                'text-[10px] mt-1 font-medium capitalize',
                                                done ? 'text-blue-600' : 'text-slate-300',
                                                active && step === 'selected' && 'text-emerald-600'
                                            )}>
                                                {step}
                                            </span>
                                        </div>
                                        {i < STATUS_STEPS.length - 1 && (
                                            <div className={cn('flex-1 h-0.5 mb-4 mx-1', i < currentStep ? 'bg-blue-400' : 'bg-slate-200')} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}

                    {isRejected && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-red-500">
                            <XCircle className="w-3.5 h-3.5" />
                            Application not shortlisted
                        </div>
                    )}

                    <p className="text-xs text-slate-400 mt-2">
                        Applied on {format(new Date(app.applied_at), 'MMM d, yyyy')}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

// ── Student Profile ──────────────────────────────────────────────────────────

const DEPARTMENTS = [
    'Computer Science', 'Information Technology', 'Electronics & Communication',
    'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
    'Chemical Engineering', 'Biotechnology', 'Other',
];

function StudentProfile({ profile, onUpdate, toast }: {
    profile: Profile;
    onUpdate: () => void;
    toast: (msg: string, type?: any) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: profile.full_name || '',
        roll_number: profile.roll_number || '',
        department: profile.department || '',
        cgpa: profile.cgpa || 0,
        skills: (profile.skills || []).join(', '),
        resume_url: profile.resume_url || '',
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const { error } = await supabase.from('profiles').update({
            ...formData,
            cgpa: Number(formData.cgpa),
            skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        }).eq('id', profile.id);
        setSaving(false);
        if (error) toast(error.message, 'error');
        else {
            setEditing(false);
            onUpdate();
            toast('Profile updated successfully!', 'success');
        }
    };

    const placementStatus = (() => {
        // We'd need to fetch from applications — for now just show Active
        return 'Active';
    })();

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Banner & Avatar */}
            <Card>
                <div className={cn('h-36 rounded-t-2xl bg-gradient-to-r', getCompanyColor(profile.full_name))} />
                <div className="px-6 pb-6 -mt-10">
                    <div className="flex items-end justify-between mb-4">
                        <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center border-4 border-white">
                            <span className={cn(
                                'w-full h-full rounded-xl bg-gradient-to-br text-white flex items-center justify-center text-2xl font-bold',
                                getCompanyColor(profile.full_name)
                            )}>
                                {getInitials(profile.full_name)}
                            </span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
                            {editing ? 'Cancel' : 'Edit Profile'}
                        </Button>
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{profile.full_name}</h1>
                        <p className="text-slate-500 text-sm">{profile.roll_number} • {profile.department || 'No department set'}</p>
                    </div>
                </div>
            </Card>

            {/* Stats */}
            {!editing && (
                <div className="grid grid-cols-3 gap-4 animate-fadeIn">
                    {[
                        { label: 'CGPA', value: profile.cgpa || '--', color: 'bg-blue-50 text-blue-700' },
                        { label: 'Skills', value: (profile.skills || []).length, color: 'bg-purple-50 text-purple-700' },
                        { label: 'Status', value: 'Active', color: 'bg-emerald-50 text-emerald-700' },
                    ].map(stat => (
                        <Card key={stat.label} className="p-4 text-center">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                            <p className={cn('text-2xl font-bold rounded-lg px-2 py-0.5 inline-block', stat.color)}>{stat.value}</p>
                        </Card>
                    ))}
                </div>
            )}

            {/* Skills */}
            {!editing && (
                <Card className="p-5 animate-fadeIn">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Skills</h3>
                    {(profile.skills || []).length === 0 ? (
                        <p className="text-sm text-slate-400">No skills added yet. Edit your profile to add skills.</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {(profile.skills || []).map((skill, i) => (
                                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {/* Resume */}
            {!editing && profile.resume_url && (
                <Card className="p-5 animate-fadeIn">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Resume</h3>
                    <a
                        href={profile.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
                    >
                        <BookOpen className="w-4 h-4" />
                        View Resume
                        <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                </Card>
            )}

            {/* Edit Form */}
            {editing && (
                <Card className="p-6 animate-fadeIn">
                    <h2 className="text-lg font-bold text-slate-900 mb-5">Edit Profile</h2>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Full Name" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} required />
                            <Input label="Roll Number" value={formData.roll_number} onChange={e => setFormData({ ...formData, roll_number: e.target.value })} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-700">Department</label>
                                <select
                                    value={formData.department}
                                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select department</option>
                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <Input label="CGPA" type="number" step="0.01" min="0" max="10" value={formData.cgpa} onChange={e => setFormData({ ...formData, cgpa: Number(e.target.value) })} />
                        </div>
                        <Input label="Skills (comma separated)" value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} placeholder="React, Python, SQL..." />
                        <Input label="Resume URL" value={formData.resume_url} onChange={e => setFormData({ ...formData, resume_url: e.target.value })} placeholder="https://drive.google.com/..." />
                        <div className="flex gap-3 pt-2">
                            <Button type="submit" className="flex-1" loading={saving}>Save Changes</Button>
                            <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                        </div>
                    </form>
                </Card>
            )}
        </div>
    );
}
