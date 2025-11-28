import React from 'react';
import RealTimeStatusWidget from '../../../customer/components/dashboard/RealTimeStatusWidget';

const UserGreeting: React.FC = () => {
    return (
        <div className="flex-shrink-0">
            <RealTimeStatusWidget />
        </div>
    );
};

export default UserGreeting;
