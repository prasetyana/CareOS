import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@core/hooks/useAuth';
import { useToast } from '@core/contexts/ToastContext';
import { addReservation } from '@core/data/mockDB';
import { Calendar as CalendarIcon, Clock, User, Check } from 'lucide-react';
import { useTenantParam } from '@core/hooks/useTenantParam';

const availableTimes = ["11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "18:00", "18:30", "19:00", "19:30", "20:00"];
const steps = ['Detail', 'Waktu', 'Konfirmasi'];

const CustomerBuatReservasiPage: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { withTenant } = useTenantParam();

    const [currentStep, setCurrentStep] = useState(1);
    const [details, setDetails] = useState({
        date: new Date().toISOString().split('T')[0],
        partySize: 2,
        time: '',
        specialRequests: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: name === 'partySize' ? parseInt(value) : value }));
    };

    const handleTimeSelect = (time: string) => {
        setDetails(prev => ({ ...prev, time }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            addToast('Anda harus masuk untuk membuat reservasi.', 'error');
            return;
        }
        if (!details.time) {
            addToast('Silakan pilih waktu reservasi.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await addReservation(user.id, {
                date: new Date(details.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
                partySize: details.partySize,
                time: details.time,
                specialRequests: details.specialRequests,
            });
            addToast('Reservasi Anda berhasil dibuat!', 'success');
            navigate(withTenant('/akun/reservasi/riwayat'));
        } catch (error) {
            addToast('Gagal membuat reservasi.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full p-3 border border-black/10 dark:border-white/10 rounded-lg bg-black/5 dark:bg-white/5 focus:ring-1 focus:ring-accent focus:border-accent transition";

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-text-muted mb-2">Pilih Tanggal</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={details.date}
                                onChange={handleDetailChange}
                                min={new Date().toISOString().split('T')[0]}
                                className={inputClasses}
                            />
                        </div>
                        <div>
                            <label htmlFor="partySize" className="block text-sm font-medium text-text-muted mb-2">Jumlah Tamu</label>
                            <select
                                id="partySize"
                                name="partySize"
                                value={details.partySize}
                                onChange={handleDetailChange}
                                className={inputClasses}
                            >
                                {[...Array(8)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1} orang</option>)}
                            </select>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <p className="text-center text-text-muted mb-6">Pilih waktu yang tersedia untuk tanggal <span className="font-semibold text-text-primary">{new Date(details.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {availableTimes.map(time => (
                                <button
                                    key={time}
                                    onClick={() => handleTimeSelect(time)}
                                    className={`p-3 rounded-lg text-center font-medium transition-colors ${details.time === time
                                        ? 'bg-accent text-white'
                                        : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                                        }`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium tracking-tight text-center text-text-primary">Konfirmasi Detail Reservasi Anda</h3>
                        <div className="bg-black/5 dark:bg-white/5 p-6 rounded-lg space-y-4">
                            <div className="flex items-center gap-4"><CalendarIcon className="w-5 h-5 text-accent" /> <span className="text-text-primary">{new Date(details.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                            <div className="flex items-center gap-4"><Clock className="w-5 h-5 text-accent" /> <span className="text-text-primary">{details.time}</span></div>
                            <div className="flex items-center gap-4"><User className="w-5 h-5 text-accent" /> <span className="text-text-primary">{details.partySize} orang</span></div>
                        </div>
                        <div>
                            <label htmlFor="specialRequests" className="block text-sm font-medium text-text-muted mb-2">Permintaan Khusus (Opsional)</label>
                            <textarea
                                id="specialRequests"
                                name="specialRequests"
                                value={details.specialRequests}
                                onChange={(e) => setDetails(prev => ({ ...prev, specialRequests: e.target.value }))}
                                rows={3}
                                placeholder="mis: kursi bayi, perayaan ulang tahun"
                                className={inputClasses}
                            ></textarea>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <div>
            {/* Title moved to parent CustomerReservasiPage */}

            {/* Stepper */}
            <div className="flex justify-between items-center max-w-md mx-auto mb-10">
                {steps.map((step, index) => (
                    <React.Fragment key={step}>
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${currentStep > index + 1 ? 'bg-accent text-white' :
                                currentStep === index + 1 ? 'border-2 border-accent text-accent' :
                                    'bg-black/10 dark:bg-white/10 text-text-muted'
                                }`}>
                                {currentStep > index + 1 ? <Check className="w-6 h-6" /> : index + 1}
                            </div>
                            <p className={`mt-2 text-xs font-medium ${currentStep >= index + 1 ? 'text-text-primary' : 'text-text-muted'}`}>{step}</p>
                        </div>
                        {index < steps.length - 1 && <div className={`flex-grow h-0.5 mx-4 ${currentStep > index + 1 ? 'bg-accent' : 'bg-black/10 dark:bg-white/10'}`}></div>}
                    </React.Fragment>
                ))}
            </div>

            <div className="max-w-md mx-auto">
                <div className="min-h-[250px]">
                    {renderStepContent()}
                </div>

                <div className="flex justify-between mt-10">
                    {currentStep > 1 ? (
                        <button onClick={handleBack} className="px-6 py-2 rounded-lg text-text-muted font-medium hover:bg-black/5 dark:hover:bg-white/5">Kembali</button>
                    ) : <div></div>}
                    {currentStep < 3 ? (
                        <button onClick={handleNext} disabled={currentStep === 2 && !details.time} className="px-6 py-2 rounded-lg bg-accent text-white font-medium hover:bg-opacity-90 disabled:bg-gray-400">Lanjutkan</button>
                    ) : (
                        <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 rounded-lg bg-accent text-white font-medium hover:bg-opacity-90 disabled:bg-gray-400">
                            {isSubmitting ? 'Mengonfirmasi...' : 'Konfirmasi Reservasi'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerBuatReservasiPage;