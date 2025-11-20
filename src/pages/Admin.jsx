import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, PlusCircle, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/common/ToastContainer';
import StatsCards from '../components/admin/StatsCards';
import FiltersBar from '../components/admin/FiltersBar';
import TeamCard from '../components/admin/TeamCard';
import TeamDetailModal from '../components/admin/TeamDetailModal';
import {
    fetchAllTeams,
    fetchTeamFullDetails,  // ✅ NEW IMPORT
    verifyTeam,
    deleteTeam,
    downloadTeamJSON,
    downloadPhotosZip
} from '../services/adminService';
import { printTeam } from '../utils/printUtils';

const Admin = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [allTeams, setAllTeams] = useState([]);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [loadingTeamDetails, setLoadingTeamDetails] = useState(false); // ✅ NEW

    const [filters, setFilters] = useState({
        search: '',
        status: '',
        sort: 'newest'
    });

    useEffect(() => {
        loadTeams();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, allTeams]);

    const loadTeams = async () => {
        setLoading(true);
        try {
            const teams = await fetchAllTeams();
            setAllTeams(teams);
            setFilteredTeams(teams);
            showToast('Teams loaded successfully', 'success');
        } catch (error) {
            console.error('Failed to load teams:', error);
            showToast('Failed to load teams', 'error');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...allTeams];

        if (filters.search) {
            result = result.filter(team =>
                team.team_name.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        if (filters.status) {
            result = result.filter(team => team.submission_status === filters.status);
        }

        result.sort((a, b) => {
            if (filters.sort === 'newest') {
                return new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0);
            }
            if (filters.sort === 'oldest') {
                return new Date(a.submittedAt || 0) - new Date(b.submittedAt || 0);
            }
            if (filters.sort === 'name') {
                return a.team_name.localeCompare(b.team_name);
            }
            return 0;
        });

        setFilteredTeams(result);
    };

    const handleClearFilters = () => {
        setFilters({ search: '', status: '', sort: 'newest' });
    };

    // ✅ FIXED: Fetch full details before opening modal
    const handleViewDetails = async (team) => {
        setLoadingTeamDetails(true);
        try {
            console.log('Fetching full details for team:', team._id);
            const fullTeamDetails = await fetchTeamFullDetails(team._id);
            console.log('Full team details:', fullTeamDetails);
            setSelectedTeam(fullTeamDetails);
        } catch (error) {
            console.error('Failed to load team details:', error);
            showToast('Failed to load team details', 'error');
        } finally {
            setLoadingTeamDetails(false);
        }
    };

    const handleVerifyTeam = async (teamId) => {
        if (!window.confirm('Are you sure you want to verify this team?')) return;

        try {
            const result = await verifyTeam(teamId);
            if (result.success) {
                showToast('Team verified successfully!', 'success');
                loadTeams();
            } else {
                showToast(result.message || 'Verification failed', 'error');
            }
        } catch (error) {
            console.error('Verification error:', error);
            showToast('Verification failed', 'error');
        }
    };

    const handleDeleteTeam = async (team) => {
        if (!window.confirm(`Delete team "${team.team_name}" permanently?`)) return;

        try {
            const result = await deleteTeam(team._id);
            if (result.success) {
                showToast('Team deleted successfully', 'success');
                loadTeams();
            } else {
                showToast(result.message || 'Delete failed', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showToast('Delete failed', 'error');
        }
    };

    const handleExportJSON = (team) => {
        downloadTeamJSON(team);
        showToast('Downloading JSON...', 'info');
    };

    const handleDownloadPhotos = async (team) => {
        showToast('Preparing photos ZIP...', 'info');
        try {
            await downloadPhotosZip(team);
            showToast('Photos downloaded successfully!', 'success');
        } catch (error) {
            console.error('Photo download error:', error);
            showToast('Failed to download photos', 'error');
        }
    };

    const handlePrint = (team) => {
        printTeam(team);
        showToast('Preparing print...', 'info');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
            {/* Navbar */}
            <nav className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-2xl">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">TTD Admin Dashboard</h1>
                            <p className="text-orange-100 text-sm mt-1">Team Registration Management</p>
                        </div>
                        <div className="flex gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/register')}
                                className="bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all shadow-lg flex items-center gap-2"
                            >
                                <PlusCircle className="w-5 h-5" />
                                New Registration
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={loadTeams}
                                disabled={loading}
                                className="bg-orange-700 px-6 py-3 rounded-xl font-semibold hover:bg-orange-800 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </motion.button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full"
                        />
                    </div>
                ) : (
                    <>
                        <StatsCards teams={allTeams} />
                        <FiltersBar
                            filters={filters}
                            setFilters={setFilters}
                            onClear={handleClearFilters}
                        />

                        {filteredTeams.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl shadow-lg p-12 text-center"
                            >
                                <FolderOpen className="w-24 h-24 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-2xl font-bold text-gray-600 mb-2">No Teams Found</h3>
                                <p className="text-gray-500 mb-6">
                                    {filters.search || filters.status
                                        ? 'Try adjusting your filters'
                                        : 'No team registrations yet. Start by adding a new team.'}
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/register')}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg"
                                >
                                    <PlusCircle className="w-5 h-5 inline mr-2" />
                                    Add New Team
                                </motion.button>
                            </motion.div>
                        ) : (
                            <div className="space-y-6">
                                {filteredTeams.map((team, index) => (
                                    <TeamCard
                                        key={team._id}
                                        team={team}
                                        index={index}
                                        onViewDetails={handleViewDetails}  /* ✅ UPDATED */
                                        onExportPDF={handlePrint}
                                        onPrint={handlePrint}
                                        onExportJSON={handleExportJSON}
                                        onDownloadPhotos={handleDownloadPhotos}
                                        onVerify={handleVerifyTeam}
                                        onDelete={handleDeleteTeam}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Detail Modal - ✅ Now receives full details */}
            {selectedTeam && (
                <TeamDetailModal
                    team={selectedTeam}
                    onClose={() => setSelectedTeam(null)}
                />
            )}

            {/* ✅ Loading overlay when fetching team details */}
            {loadingTeamDetails && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full"
                    />
                </div>
            )}
        </div>
    );
};

export default Admin;