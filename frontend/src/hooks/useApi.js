import { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS, getAuthHeader } from '../config';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = async (method, endpoint, data = null) => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      };

      const response = await axios({
        method,
        url: endpoint,
        data,
        headers
      });

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    apiCall
  };
};

export default useApi; 