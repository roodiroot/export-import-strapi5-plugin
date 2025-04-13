import fs from 'fs';
import csv from 'csv-parser';
import { Parser } from 'json2csv';
import type { Core } from '@strapi/strapi';

import { PLUGIN_ID } from '../../../pluginId';
import { ConfigData } from '../../../types';

const myController = ({ strapi }: { strapi: Core.Strapi }) => ({
  // отправка конфигураций на фронт кнопкам
  async getConfig(ctx) {
    const config = strapi.plugin(PLUGIN_ID).config('entities');
    ctx.body = config;
  },

  // загрузка файла CSV на фронт
  async getData(ctx) {
    const { data, modelName } = ctx.request.body;
    const _q = data?._q || undefined;
    const baseFilter = {
      publishedAt: {
        $notNull: true,
      },
    };

    let finalFilters = { ...baseFilter };

    const configFields: ConfigData = strapi.plugin(PLUGIN_ID).config('entities');
    const fieldsArray = configFields[modelName]?.fields || [];
    console.log(
      '%c Start download!',
      'color: red; background: yellow; font-size: 16px; padding: 5px;'
    );
    try {
      const products = await strapi.db.query(modelName).findMany({
        where: finalFilters,
        populate: true,
        _q,
      });
      console.log(
        '%c Finish download!',
        'color: red; background: yellow; font-size: 16px; padding: 5px;'
      );
      // Определяем нужные поля для CSV
      const fields = ['documentId', ...fieldsArray];
      const csv = new Parser({ fields }).parse(products);
      console.log(
        '%c Update CSV!',
        'color: red; background: yellow; font-size: 16px; padding: 5px;'
      );
      ctx.set('Content-Disposition', 'attachment; filename=products.csv');
      ctx.set('Content-Type', 'text/csv');
      ctx.body = { csv };
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      ctx.throw(500, 'Ошибка получения данных');
    }
  },

  // изменение данных которые приходят с фронта
  async updateData(ctx) {
    try {
      console.log('Получен запрос на импорт CSV');

      const { files, body } = ctx.request;
      const modelName = body?.modelName || undefined;

      if (!files || !files?.file || !modelName) {
        return ctx.badRequest('Файл не загружен');
      }

      const filePath = files.file?.filepath;
      const updatedProducts = [];

      // Читаем CSV
      const stream = fs.createReadStream(filePath).pipe(csv());
      const { attributes } = strapi.contentType(modelName);

      for await (const row of stream) {
        const { documentId } = row;

        if (documentId) {
          // Создаем пустой объект для данных
          const data: Record<string, any> = {};

          Object.keys(row).forEach((key) => {
            if (attributes[key]) {
              const attributesKey = attributes[key];
              const type = attributesKey.type;
              const value = row[key];

              if (value === undefined || value === null || value === '') {
                return;
              }

              // Проверяем тип поля и преобразуем значение
              if (type === 'integer' || type === 'biginteger') {
                const parsed = parseInt(value);
                if (!isNaN(parsed)) data[key] = parsed;
              } else if (type === 'float' || type === 'decimal') {
                const parsed = parseFloat(value);
                if (!isNaN(parsed)) data[key] = parsed;
              } else if (type === 'boolean') {
                data[key] = value.toLowerCase() === 'true';
              } else if (type === 'string' || type === 'text') {
                data[key] = value.trim();
              } else {
                console.log(`Поле ${key} с типом ${type} проигнорировано`);
              }
            }
          });

          // Проверяем, есть ли данные для обновления
          if (Object.keys(data).length > 0) {
            const updatedProduct = await strapi.documents(modelName).update({
              documentId,
              data,
              status: 'published',
            });

            updatedProducts.push(updatedProduct);
          } else {
            console.log(
              `Пропуск обновления для documentId: ${documentId} - нет данных для обновления`
            );
          }
        }
      }

      // Удаляем файл после обработки
      await fs.promises.unlink(filePath);
      console.log('Файл успешно удален:', filePath);

      return ctx.send({ success: true, updated: updatedProducts.length });
    } catch (error) {
      console.error('Ошибка при обработке CSV:', error);
      ctx.throw(500, 'Ошибка обработки CSV');
    }
  },
});

export default myController;
