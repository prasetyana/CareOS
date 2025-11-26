import React from 'react';
import { useLiveChat } from '../../contexts/LiveChatContext';
import StatCard from '../../components/StatCard';
import { MessageSquare, Star, Clock, Timer } from 'lucide-react';

const formatDuration = (seconds: number | null) => {
    if (seconds === null) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}d`;
};

const StatistikChatPage: React.FC = () => {
    const { analytics } = useLiveChat();

    const maxCount = Math.max(...analytics.satisfactionDistribution.map(d => d.count), 0);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Percakapan"
                    value={analytics.totalChats.toString()}
                    icon={<MessageSquare className="w-8 h-8 text-brand-primary" />}
                />
                <StatCard 
                    title="Kepuasan Rata-rata"
                    value={analytics.averageSatisfaction ? `${analytics.averageSatisfaction.toFixed(2)} / 5` : 'N/A'}
                    icon={<Star className="w-8 h-8 text-brand-primary" />}
                />
                <StatCard 
                    title="Waktu Respons Pertama"
                    value={formatDuration(analytics.averageFirstResponseTime)}
                    icon={<Clock className="w-8 h-8 text-brand-primary" />}
                />
                <StatCard 
                    title="Durasi Chat Rata-rata"
                    value={formatDuration(analytics.averageChatDuration)}
                    icon={<Timer className="w-8 h-8 text-brand-primary" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-text-primary mb-4">Distribusi Kepuasan</h3>
                    <div className="space-y-3">
                        {analytics.satisfactionDistribution.map(({ star, count }) => (
                            <div key={star} className="flex items-center gap-3">
                                <span className="text-sm font-medium text-text-muted">{star} ★</span>
                                <div className="flex-grow bg-neutral-100 dark:bg-neutral-700 rounded-full h-5">
                                    <div 
                                        className="bg-accent h-5 rounded-full flex items-center justify-end px-2"
                                        style={{ width: maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%' }}
                                    >
                                        <span className="text-xs font-bold text-white">{count}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-text-primary mb-4">Performa Agen</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Agen</th>
                                    <th scope="col" className="px-6 py-3">Chat Ditangani</th>
                                    <th scope="col" className="px-6 py-3">Kepuasan Rata-rata</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.agentPerformance.map(agent => (
                                    <tr key={agent.agentId} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent">
                                                    {agent.agentName.charAt(0)}
                                                </div>
                                                {agent.agentName}
                                            </div>
                                        </th>
                                        <td className="px-6 py-4">{agent.chatsHandled}</td>
                                        <td className="px-6 py-4">
                                            {agent.averageSatisfaction ? `${agent.averageSatisfaction.toFixed(2)} ★` : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {analytics.agentPerformance.length === 0 && (
                            <p className="text-center py-8 text-text-muted">Tidak ada data performa agen.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatistikChatPage;