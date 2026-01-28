import { useEffect, useState } from "react";
import { attacksAPI } from "../services/api";
import { CheckSquare, Search, Square } from "lucide-react";
import useStore from "../store/useStore";


function AttacksPage() {
    const { attacks, setAttacks, selectedAttacks, toggleAttack, selectAllAttacks, clearSelectedAttacks } = useStore();
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSeachTerm] = useState('');

    useEffect(() => {
        loadAttacks();
        loadCategories();
    }, []);

    const loadAttacks = async () => {
        try {
            const res = await attacksAPI.getAll();
            setAttacks(res.data || []);
        } catch (error) {
            console.error('Failed to load attacks:', error);
        }
    };

    const loadCategories = async () => {
        try {
            const res = await attacksAPI.getCategories();
            setCategories(res.data?.categories || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const filteredAttacks = attacks.filter(attack => {
        const matchesCategory = activeCategory === 'all' || attack.category === activeCategory;
        const matchesSearch = attack.name.toLowerCase().includes(searchTerm.toLowerCase()) || attack.desciption?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
            case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            default: return 'bg-green-500/20 text-green-400 border-green-500/50';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Attack Library</h1>
                    <p className="text-slate-400 mt-1">Select attacks to test your LLM ({selectedAttacks.length} selected)</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={selectAllAttacks}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                    >
                        Select All
                    </button>
                    <button
                        onClick={clearSelectedAttacks}
                        className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search attacks..."
                        value={searchTerm}
                        onChange={(e) => setSeachTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[#1e293b] border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`px-4 py-2 rounded-lg transition-colors ${activeCategory === 'all' ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'}`}
                    >
                        All ({attacks.length})
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`px-4 py-2 rounded-lg transition-colors ${activeCategory === category.id ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'}`}
                        >
                            {category.icon} {category.name} ({category.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Attacks Grid */}
            <div className="grid gap-3">
                {filteredAttacks.map((attack) => {
                    const isSelected = selectedAttacks.includes(attack.id);
                    return (
                        <div
                            key={attack.id}
                            onClick={() => toggleAttack(attack.id)}
                            className={`p-4 rounded-lg transition-colors ${isSelected ? 'bg-indigo-500/20 border-indigo-500' : 'bg-[#1e293b] border-slate-700 hover:bg-slate-600'}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="mt-1">
                                    {isSelected ? (
                                        <CheckSquare className="w-5 h-5 text-indigo-400" />
                                    ) : (
                                        <Square className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-white font-medium">{attack.name}</h3>
                                        <span className={`px-2 py-0.5 text-xs rounded border ${getSeverityColor(attack.severity)}`}>
                                            {attack.severity}
                                        </span>
                                        <span className="text-xs text-slate-500">{attack.category}</span>
                                    </div>
                                    <p className="text-sm text-slate-400">{attack.description}</p>
                                    {attack.source && (
                                        <p className="text-xs text-slate-500 mt-1">Source: {attack.source}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default AttacksPage;