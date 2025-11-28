
import React from 'react';
import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';

interface LoyaltyStatusCardProps {
    points: number;
}

const LoyaltyStatusCard: React.FC<LoyaltyStatusCardProps> = ({ points }) => {
    const nextLevelPoints = 2000;
    const progress = Math.min((points / nextLevelPoints) * 100, 100);

    return (
        <div className="p-6 rounded-3xl bg-surface/80 backdrop-blur-xl border border-glass-border shadow-card flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-text-primary">Status Loyalti</h3>
                    <Award className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-3xl font-bold text-text-primary">{points.toLocaleString('id-ID')} <span className="text-lg font-medium text-text-muted">Poin</span></p>
                <div className="mt-4">
                    <div className="w-full bg-black/5 dark:bg-white/10 rounded-full h-2">
                        <div 
                            className="bg-accent h-2 rounded-full" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-text-muted mt-2">
                        {nextLevelPoints - points > 0 ? `${(nextLevelPoints - points).toLocaleString('id-ID')} poin lagi untuk mencapai level Gold 🏆` : "Anda telah mencapai level Gold! 🏆"}
                    </p>
                </div>
            </div>
            <Link to="/akun/poin-hadiah" className="mt-6 block w-full text-center bg-accent/10 text-accent font-semibold py-2.5 rounded-lg text-sm hover:bg-accent/20 transition-colors">
                Tukar Poin
            </Link>
        </div>
    );
};

export default LoyaltyStatusCard;
