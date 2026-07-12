import apiClient from '../../../services/apiClient';

const unwrap = (res) => res?.data?.data ?? res?.data;

export const getReportsSummary = async () => unwrap(await apiClient.get('/reports/summary'));
export const exportReport = async () => {
  const res = await apiClient.get('/reports/export', { params: { format: 'csv' }, responseType: 'blob' });
  return res.data;
};