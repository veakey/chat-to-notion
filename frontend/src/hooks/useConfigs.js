/**
 * Hook pour gérer la liste des configurations Notion (multi-configs)
 */
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function useConfigs() {
  const [configs, setConfigs] = useState([]);
  const [activeConfigId, setActiveConfigId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/configs`);
      const list = response.data.configs || [];
      setConfigs(list);
      const active = list.find((c) => c.isActive);
      setActiveConfigId(active ? active.id : list[0]?.id || null);
    } catch (err) {
      console.error('Erreur lors du chargement des configurations:', err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const addConfig = async ({ apiKey, databaseId, label }) => {
    const response = await axios.post(`${API_BASE_URL}/api/configs`, {
      apiKey,
      databaseId,
      label,
    });
    await fetchConfigs();
    return response.data?.config;
  };

  const updateConfig = async (configId, payload) => {
    const response = await axios.put(`${API_BASE_URL}/api/configs/${configId}`, payload);
    await fetchConfigs();
    return response.data?.config;
  };

  const deleteConfig = async (configId) => {
    await axios.delete(`${API_BASE_URL}/api/configs/${configId}`);
    await fetchConfigs();
  };

  const selectConfig = async (configId) => {
    await axios.patch(`${API_BASE_URL}/api/configs/${configId}/select`);
    await fetchConfigs();
  };

  const activeConfig = configs.find((c) => c.id === activeConfigId) || null;

  return {
    configs,
    activeConfigId,
    activeConfig,
    loading,
    initialLoading,
    fetchConfigs,
    addConfig,
    updateConfig,
    deleteConfig,
    selectConfig,
    setActiveConfigId, // pour usage local éventuel
  };
}

