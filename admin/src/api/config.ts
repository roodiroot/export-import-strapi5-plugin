import axios from 'axios';
import { PLUGIN_ID } from '../../../pluginId';
import { ConfigData } from '../../../types';

const getConfig = async (): Promise<ConfigData> => {
  const { data } = await axios.post(`/${PLUGIN_ID}/get-config`);
  return data;
};

export { getConfig };
