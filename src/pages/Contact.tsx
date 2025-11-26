
import React from 'react';
import PageHeader from '../components/PageHeader';

const Contact: React.FC = () => {
  return (
    <div className="bg-brand-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <PageHeader 
          title="Hubungi Kami"
          subtitle="Kami ingin mendengar dari Anda. Baik itu reservasi, umpan balik, atau pertanyaan, tim kami siap membantu."
        />

        <div className="mt-16 bg-white p-8 sm:p-12 rounded-2xl shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-sans font-bold text-brand-dark mb-6">Informasi Kontak</h3>
              <div className="space-y-6 text-brand-secondary text-lg">
                <p>
                  <strong className="text-brand-dark">Alamat:</strong><br />
                  Jl. Kuliner 123, Kota Foodie, 10101
                </p>
                <p>
                  <strong className="text-brand-dark">Telepon:</strong><br />
                  (021) 123-4567
                </p>
                <p>
                  <strong className="text-brand-dark">Email:</strong><br />
                  reservasi@dineos.com
                </p>
                <p>
                  <strong className="text-brand-dark">Jam Buka:</strong><br />
                  Senin-Jumat: 17.00 - 23.00<br />
                  Sabtu-Minggu: 16.00 - 24.00
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-sans font-bold text-brand-dark mb-6">Kirim kami pesan</h3>
              <form action="#" method="POST" className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-brand-secondary mb-1">Nama Lengkap</label>
                  <input type="text" name="name" id="name" autoComplete="name" className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 border border-gray-300 rounded-lg text-lg transition focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent" placeholder="Nama lengkap Anda" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-brand-secondary mb-1">Email</label>
                  <input id="email" name="email" type="email" autoComplete="email" className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 border border-gray-300 rounded-lg text-lg transition focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent" placeholder="anda@contoh.com" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-brand-secondary mb-1">Pesan</label>
                  <textarea id="message" name="message" rows={4} className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 border border-gray-300 rounded-lg text-lg transition focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent" placeholder="Pesan Anda..."></textarea>
                </div>
                <div>
                  <button type="submit" className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-brand-primary hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors duration-300">
                    Kirim
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;