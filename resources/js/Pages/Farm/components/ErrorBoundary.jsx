import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Antigravity UI caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white border border-[#DCE5F0] rounded-2xl p-8 max-w-xl mx-auto my-8 text-center shadow-xs font-body animate-fadeIn">
          <div className="w-14 h-14 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center text-rose-600 mx-auto mb-4">
            <AlertCircle className="w-8 h-8 stroke-2" />
          </div>
          <h2 className="text-base font-bold text-[#162033] font-heading mb-2">
            Terjadi Kendala Tampilan
          </h2>
          <p className="text-xs text-[#64748B] mb-5 leading-relaxed">
            Halaman mengalami sedikit kendala saat memuat data. Silakan muat ulang halaman untuk melanjutkan.
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#12355B] hover:bg-[#0D2847] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Muat Ulang Halaman</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

