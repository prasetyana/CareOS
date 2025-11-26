import React from 'react';
import { CustomerActivity } from '../../data/mockDB';
import { Eye, ShoppingBag, MessageSquare } from 'lucide-react';

interface CustomerJourneyTimelineProps {
    activities: CustomerActivity[];
}

const activityMeta: Record<CustomerActivity['type'], { icon: React.FC<any>; color: string }> = {
    page_view: { icon: Eye, color: 'bg-sky-500' },
    placed_order: { icon: ShoppingBag, color: 'bg-green-500' },
    started_chat: { icon: MessageSquare, color: 'bg-indigo-500' },
};

const formatTimeAgo = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return `${diffSeconds}d lalu`;
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m lalu`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}j lalu`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}h lalu`;
};


const CustomerJourneyTimeline: React.FC<CustomerJourneyTimelineProps> = ({ activities }) => {
    if (activities.length === 0) {
        return <p className="text-xs text-text-muted text-center py-4">Tidak ada aktivitas terbaru.</p>;
    }

    return (
        <div className="flow-root">
            <ul className="-mb-4">
                {activities.map((activity, activityIdx) => (
                    <li key={activity.id}>
                        <div className="relative pb-4">
                            {activityIdx !== activities.length - 1 ? (
                                <span className="absolute left-3 top-3 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex items-start space-x-3">
                                <div>
                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white ${activityMeta[activity.type].color}`}>
                                        {(() => {
                                            const Icon = activityMeta[activity.type].icon;
                                            return <Icon className="h-3.5 w-3.5" />;
                                        })()}
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div>
                                        <div className="text-xs">
                                            <p className="font-medium text-text-muted">{activity.description}</p>
                                        </div>
                                        <p className="mt-0.5 text-xs text-text-muted">
                                            {formatTimeAgo(activity.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CustomerJourneyTimeline;