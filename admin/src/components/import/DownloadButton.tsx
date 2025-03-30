import { Download } from '@strapi/icons';
import { Button } from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';
import { unstable_useContentManagerContext as useContentManagerContext } from '@strapi/strapi/admin';

import { PLUGIN_ID } from '../../pluginId';

export const DownloadButton = () => {
  const { model } = useContentManagerContext();
  const { get } = useFetchClient();

  const fetchData = async () => {
    try {
      const response = await get(`/${PLUGIN_ID}/export-csv`);

      // Создаем Blob из строки CSV
      const blob = new Blob([response.data.csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);

      // Создаем ссылку и запускаем скачивание
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Освобождаем URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
    }
  };

  if (model !== 'api::product.product') return null;

  return (
    <Button startIcon={<Download />} onClick={fetchData}>
      Export
    </Button>
  );
};
