import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Clock, CheckCircle } from 'lucide-react';

const StatsCards = ({ teams }) => {
    const totalTeams = teams.length;
    const totalMembers = teams.reduce((sum, team) => sum + team.members_count, 0);
    const verifiedTeams = teams.filter(t => t.submission_status === 'verified').length;
    const pendingTeams = teams.filter(t => t.submission_status === 'pending').length;

    const stats = [
        {
            label: 'Total Teams',
            value: totalTeams,
            icon: Users,
            color: 'blue',
            gradient: 'from-blue-500 to-blue-600'
        },
        {
            label: 'Total Members',
            value: totalMembers,
            icon: UserCheck,
            color: 'green',
            gradient: 'from-green-500 to-green-600'
        },
        {
            label: 'Verified',
            value: verifiedTeams,
            icon: CheckCircle,
            color: 'emerald',
            gradient: 'from-emerald-500 to-emerald-600'
        },
        {
            label: 'Pending',
            value: pendingTeams,
            icon: Clock,
            color: 'yellow',
            gradient: 'from-yellow-500 to-yellow-600'
        }
    ];

    return (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-semibold mb-1">{stat.label}</p>
                            <motion.p
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                                className="text-4xl font-bold text-gray-800"
                            >
                                {stat.value}
                            </motion.p>
                        </div>
                        <div className={`bg-gradient-to-br ${stat.gradient} p-4 rounded-xl`}>
                            <stat.icon className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default StatsCards;