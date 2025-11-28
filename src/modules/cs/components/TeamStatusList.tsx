import React from 'react';
import { useLiveChat } from '@core/contexts/LiveChatContext';
import { mockUsers } from '@core/data/mockDB';
import { AgentStatus } from '@core/contexts/LiveChatContext';

const statusColors: Record<AgentStatus, string> = {
    online: 'bg-success',
    away: 'bg-yellow-500',
    offline: 'bg-gray-400',
};

const TeamStatusList: React.FC = () => {
    const { agentStatus } = useLiveChat();
    const teamMembers = mockUsers.filter(u => u.role === 'cs' || u.role === 'admin');

    return (
        <div className="px-2">
            <h3 className="px-2 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Tim</h3>
            <ul className="space-y-1">
                {teamMembers.map(member => {
                    const status = agentStatus[member.id] || 'offline';
                    return (
                        <li key={member.id} className="flex items-center gap-3 p-2 rounded-lg">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center font-bold text-sm text-accent">
                                    {member.name.charAt(0)}
                                </div>
                                <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ${statusColors[status]} ring-2 ring-white/70 dark:ring-gray-800/70`}></span>
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-text-primary truncate">{member.name}</p>
                                <p className="text-xs text-text-muted capitalize">{status}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default TeamStatusList;
