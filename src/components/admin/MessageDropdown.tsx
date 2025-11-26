import React from 'react';

const mockMessages = [
    { id: 1, sender: 'Jane Doe', subject: 'Pertanyaan tentang reservasi', time: '15 menit yang lalu', read: false },
    { id: 2, sender: 'Chef Anton', subject: 'Stok bahan untuk spesial mingguan', time: '2 jam yang lalu', read: false },
    { id: 3, sender: 'Tim Pemasaran', subject: 'Draf kampanye promosi baru', time: '8 jam yang lalu', read: true },
    { id: 4, sender: 'John Smith', subject: 'Umpan balik tentang makan malam kemarin', time: '1 hari yang lalu', read: true },
];

const MessageDropdown: React.FC = () => {
    return (
        <div 
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 overflow-hidden animate-scale-in"
            style={{ transformOrigin: 'top right' }}
        >
            <div className="p-4 border-b dark:border-gray-700">
                <h3 className="font-semibold text-brand-dark dark:text-gray-200">Pesan Masuk</h3>
            </div>
            <ul className="divide-y dark:divide-gray-700 max-h-96 overflow-y-auto">
                {mockMessages.map(msg => (
                    <li key={msg.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!msg.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                        <a href="#" className="block">
                            <div className="flex justify-between items-start">
                                <p className="font-medium text-sm text-brand-dark dark:text-gray-200">{msg.sender}</p>
                                {!msg.read && <span className="h-2 w-2 mt-1 rounded-full bg-apple-blue flex-shrink-0"></span>}
                            </div>
                            <p className="text-sm text-brand-secondary dark:text-gray-300 truncate">{msg.subject}</p>
                            <p className="text-xs text-brand-secondary dark:text-gray-400 mt-1">{msg.time}</p>
                        </a>
                    </li>
                ))}
            </ul>
            <div className="p-2 border-t dark:border-gray-700 text-center">
                 <a href="#" className="text-sm font-medium text-brand-primary hover:underline">Lihat semua pesan</a>
            </div>
        </div>
    );
};

export default MessageDropdown;