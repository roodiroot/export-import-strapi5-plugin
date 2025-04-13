import { Download } from '@strapi/icons';
import { useEffect, useState } from 'react';
import { Button } from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';
import {
  unstable_useContentManagerContext as useContentManagerContext,
  useQueryParams,
} from '@strapi/strapi/admin';

import { PLUGIN_ID } from '../../../../pluginId';
import { getConfig } from '../../../src/api/config';

export const DownloadButton = () => {
  const [config, setConfig] = useState<string[] | null>(null);

  const { model } = useContentManagerContext();
  const [{ query }, setQuery] = useQueryParams();
  const { post, get } = useFetchClient();

  useEffect(() => {
    const fetchConfig = async () => {
      const configData = await getConfig();
      const configModels = Object.keys(configData);
      setConfig(configModels);
    };

    fetchConfig();
  }, []);

  // console.log(config);

  if (!config) return null;
  if (!config?.includes(model)) return null;

  const fetchData = async () => {
    try {
      const response = await post(`/${PLUGIN_ID}/export-csv`, { data: query, modelName: model });

      // Создаем Blob из строки CSV
      const blob = new Blob([response.data.csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);

      // Формируем уникальное имя файла
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Формат: 2025-03-30T12-34-56-789Z
      const filename = `export-${timestamp}.csv`;

      // Создаем ссылку и запускаем скачивание
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Освобождаем URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
    }
  };

  return (
    <Button startIcon={<Download />} onClick={fetchData}>
      Export
    </Button>
  );
};
