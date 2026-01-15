import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SortAsc, X } from 'lucide-react';

const FiltersBar = ({ filters, setFilters, onClear }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
            <div className="grid md:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Search Team
                    </label>
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        placeholder="Search by team name..."
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                </div>

                {/* Status Filter */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Filter by Status
                    </label>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {/* Sort */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <SortAsc className="w-4 h-4" />
                        Sort By
                    </label>
                    <select
                        value={filters.sort}
                        onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name">Team Name A-Z</option>
                    </select>
                </div>

                {/* Clear Button */}
                <div className="flex items-end">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClear}
                        className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Clear Filters
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default FiltersBar;