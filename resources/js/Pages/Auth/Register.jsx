import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F4F7FB] via-[#EBF2FA] to-[#F4F7FB] flex items-center justify-center px-4 font-body antialiased relative overflow-hidden">
            {/* Subtle Ambient Decorative Circles */}
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl pointer-events-none" />

            <Head>
                <title>Register — SIMANTRA</title>
            </Head>

            <div className="w-full max-w-[420px] z-10 my-6">
                <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl overflow-hidden shadow-2xl">
                    {/* Top Navy Header Bar */}
                    <div className="bg-gradient-to-r from-[#0D2847] via-[#12355B] to-[#0D2847] py-8 px-6 text-center text-white relative">
                        <h1 className="text-2xl sm:text-3xl font-black tracking-wider uppercase text-white block leading-tight font-brand">
                            SIMANTRA<span className="text-emerald-400">.</span>
                        </h1>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-200/90 block mt-1.5 font-body">
                            CREATE NEW ACCOUNT
                        </span>
                    </div>

                    <div className="p-7 sm:p-9 space-y-5">
                        <form onSubmit={submit} className="space-y-4 font-body">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-[11px] font-semibold text-[#162033] mb-1.5 uppercase tracking-wider">
                                    FULL NAME
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#12355B]">
                                        <User className="h-4 w-4 stroke-2" />
                                    </span>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full pl-10 pr-3 py-3 text-xs rounded-xl border border-[#DCE5F0] outline-none focus:border-[#12355B] focus:ring-2 focus:ring-slate-500/20 bg-white text-[#162033] transition-all font-medium"
                                        required
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-[10px] text-[#12355B] font-semibold mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-[11px] font-semibold text-[#162033] mb-1.5 uppercase tracking-wider">
                                    EMAIL ADDRESS
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#12355B]">
                                        <Mail className="h-4 w-4 stroke-2" />
                                    </span>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full pl-10 pr-3 py-3 text-xs rounded-xl border border-[#DCE5F0] outline-none focus:border-[#12355B] focus:ring-2 focus:ring-slate-500/20 bg-white text-[#162033] transition-all font-medium"
                                        required
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-[10px] text-[#12355B] font-semibold mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-[11px] font-semibold text-[#162033] mb-1.5 uppercase tracking-wider">
                                    PASSWORD
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#12355B]">
                                        <Lock className="h-4 w-4 stroke-2" />
                                    </span>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full pl-10 pr-10 py-3 text-xs rounded-xl border border-[#DCE5F0] outline-none focus:border-[#12355B] focus:ring-2 focus:ring-slate-500/20 bg-white text-[#162033] transition-all font-medium"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#12355B] focus:outline-none transition-colors cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4 stroke-2" /> : <Eye className="h-4 w-4 stroke-2" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-[10px] text-[#12355B] font-semibold mt-1">{errors.password}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="password_confirmation" className="block text-[11px] font-semibold text-[#162033] mb-1.5 uppercase tracking-wider">
                                    CONFIRM PASSWORD
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#12355B]">
                                        <Lock className="h-4 w-4 stroke-2" />
                                    </span>
                                    <input
                                        id="password_confirmation"
                                        type={showConfirm ? "text" : "password"}
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="w-full pl-10 pr-10 py-3 text-xs rounded-xl border border-[#DCE5F0] outline-none focus:border-[#12355B] focus:ring-2 focus:ring-slate-500/20 bg-white text-[#162033] transition-all font-medium"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#12355B] focus:outline-none transition-colors cursor-pointer"
                                    >
                                        {showConfirm ? <EyeOff className="h-4 w-4 stroke-2" /> : <Eye className="h-4 w-4 stroke-2" />}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="text-[10px] text-[#12355B] font-semibold mt-1">{errors.password_confirmation}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <span className="text-[12px] text-[#64748B] font-medium">
                                    Already have an account?
                                </span>
                                <Link
                                    href={route('login')}
                                    className="text-[12px] font-semibold text-[#12355B] hover:text-[#0D2847] transition-colors"
                                >
                                    Sign In
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 btn-gradient text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center cursor-pointer mt-4"
                            >
                                REGISTER
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
