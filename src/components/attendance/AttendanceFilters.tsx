'use client';

interface AttendanceFiltersProps {
    statusFilter: string;
    onStatusFilterChange: (status: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export default function AttendanceFilters({
    statusFilter,
    onStatusFilterChange,
    searchQuery,
    onSearchChange,
}: AttendanceFiltersProps) {
    const statusOptions = [
        { value: 'all', label: 'Tümü', icon: '📋' },
        { value: 'present', label: 'Geldi', icon: '✅' },
        { value: 'absent', label: 'Gelmedi', icon: '❌' },
        { value: 'late', label: 'Geç Kaldı', icon: '⏰' },
        { value: 'excused', label: 'İzinli', icon: '📝' },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 w-full md:max-w-md">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Öğrenci ara..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Status Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1 w-full md:w-auto">
                    {statusOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onStatusFilterChange(option.value)}
                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${statusFilter === option.value
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <span className="mr-1">{option.icon}</span>
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
