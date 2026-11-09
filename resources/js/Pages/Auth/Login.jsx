import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post('/login', {
            preserveScroll: true,
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F4F7FB] via-[#EBF2FA] to-[#F4F7FB] flex items-center justify-center px-4 font-body antialiased relative overflow-hidden">
            {/* Subtle Ambient Decorative Circles */}
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl pointer-events-none" />

            <Head>
                <title>Login — SIMANTRA</title>
            </Head>

            <div className="w-full max-w-[400px] z-10 my-6">
                <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl overflow-hidden shadow-2xl">
                    {/* Top Navy Header Bar */}
                    <div className="bg-gradient-to-r from-[#0D2847] via-[#12355B] to-[#0D2847] py-8 px-6 text-center text-white relative">
                        <h1 className="text-2xl sm:text-3xl font-black tracking-wider uppercase text-white block leading-tight font-brand">
                            SIMANTRA<span className="text-emerald-400">.</span>
                        </h1>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-200/90 block mt-1.5 font-body">
                            SIGN IN TO YOUR ACCOUNT
                        </span>
                    </div>

                    <div className="p-7 sm:p-9 space-y-5">
                        {status && (
                            <div className="text-center text-xs text-[#12355B] font-semibold bg-blue-50 border border-blue-200 py-2.5 px-3 rounded-xl">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4 font-body">
                            {/* Email Address */}
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
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full pl-10 pr-3 py-3 text-xs rounded-xl border border-[#DCE5F0] outline-none focus:border-[#12355B] focus:ring-2 focus:ring-slate-500/20 bg-white text-[#162033] transition-all font-medium"
                                        required
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-[11px] text-[#12355B] font-semibold mt-1">{errors.email}</p>
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
                                        autoComplete="current-password"
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
                                    <p className="text-[11px] text-[#12355B] font-semibold mt-1">{errors.password}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 btn-gradient text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center cursor-pointer mt-4 disabled:opacity-80"
                            >
                                LOGIN
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
