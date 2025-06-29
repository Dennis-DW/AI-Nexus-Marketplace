import { motion } from 'framer-motion';
import { Search, Filter, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { modelAPI } from '../services/api';
import { useContract } from '../hooks/useContract';
import ModelCard from './ModelCard';
import ListModelModal from './ListModelModal';

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showListModal, setShowListModal] = useState(false);
  const [viewMode, setViewMode] = useState<'backend' | 'contract'>('backend');

  const { models: contractModels, refetchModels } = useContract();

  const categories = ['All', 'NLP', 'Computer Vision', 'Audio', 'Generative', 'Prediction', 'Other'];

  // Fetch models from backend
  const { data: backendData, isLoading: backendLoading, refetch: refetchBackendModels } = useQuery({
    queryKey: ['models', searchTerm, selectedCategory],
    queryFn: () => modelAPI.getModels({
      search: searchTerm || undefined,
      type: selectedCategory !== 'All' ? selectedCategory : undefined,
      limit: 50,
    }),
    refetchInterval: 30000,
  });

  const backendModels = backendData?.data || [];

  // Combine and filter models based on view mode
  const getDisplayModels = () => {
    if (viewMode === 'contract') {
      return contractModels?.filter(model => {
        const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             model.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || model.modelType === selectedCategory;
        return matchesSearch && matchesCategory;
      }) || [];
    } else {
      return backendModels.filter((model: any) => {
        const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             model.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || model.type === selectedCategory;
        return matchesSearch && matchesCategory;
      });
    }
  };

  const displayModels = getDisplayModels();

  const handleModelListed = () => {
    refetchModels();
    refetchBackendModels();
    setShowListModal(false);
  };

  return (
    <section id="marketplace" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-zinc-800">AI Model </span>
            <span className="gradient-text">Marketplace</span>
          </h2>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto">
            Discover, purchase, and deploy cutting-edge AI models from the global community
          </p>
        </motion.div>

        {/* Controls */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search AI models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 glass rounded-lg text-zinc-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter and Actions */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="glass rounded-lg px-4 py-3 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category} className="bg-slate-800">
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowListModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>List Model</span>
              </button>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <button
              onClick={() => setViewMode('backend')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                viewMode === 'backend'
                  ? 'bg-blue-500 text-zinc-800'
                  : 'glass text-gray-500 hover:text-zinc-800'
              }`}
            >
              Database Models ({backendModels.length})
            </button>
            <button
              onClick={() => setViewMode('contract')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                viewMode === 'contract'
                  ? 'bg-purple-500 text-zinc-800'
                  : 'glass text-gray-500 hover:text-zinc-800'
              }`}
            >
              Blockchain Models ({contractModels?.length || 0})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {(backendLoading && viewMode === 'backend') && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
        )}

        {/* Model Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayModels.map((model: any, index: number) => (
            <motion.div
              key={model.id || model._id || index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <ModelCard 
                model={model} 
                isContractModel={viewMode === 'contract'}
              />
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {displayModels.length === 0 && !backendLoading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">
              {viewMode === 'contract' 
                ? 'No blockchain models found matching your criteria.'
                : 'No database models found matching your criteria.'
              }
            </p>
            <button
              onClick={() => setShowListModal(true)}
              className="btn-secondary"
            >
              List the First Model
            </button>
          </div>
        )}

        {/* List Model Modal */}
        <ListModelModal
          isOpen={showListModal}
          onClose={() => setShowListModal(false)}
          onModelListed={handleModelListed}
        />
      </div>
    </section>
  );
}