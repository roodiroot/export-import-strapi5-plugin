import fs from 'fs';
import csv from 'csv-parser';
import type { Core } from '@strapi/strapi';
import { Parser } from 'json2csv';

const myController = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getData(ctx) {
    const products = await strapi.db.query('api::product.product').findMany({
      where: {
        publishedAt: {
          $notNull: true,
        },
      },
    });

    // console.log(products);

    // Определяем нужные поля для CSV
    const fields = [
      'documentId',
      'name',
      'slug',
      'price',
      'old_price',
      'popularity',
      'available',
      'createdAt',
      'updatedAt',
    ];

    // Преобразуем данные в CSV
    const csv = new Parser({ fields }).parse(products);

    // Отправляем CSV в ответе
    ctx.set('Content-Disposition', 'attachment; filename=products.csv');
    ctx.set('Content-Type', 'text/csv');
    ctx.body = { csv };
  },

  async updateData(ctx) {
    try {
      console.log('Получен запрос на импорт CSV');

      const { files } = ctx.request;

      if (!files || !files.file) {
        return ctx.badRequest('Файл не загружен');
      }

      const filePath = files.file.filepath;
      const updatedProducts = [];

      // Читаем CSV
      const stream = fs.createReadStream(filePath).pipe(csv());

      for await (const row of stream) {
        const { price, old_price, documentId } = row;

        if (documentId) {
          const updatedProduct = await strapi.documents('api::product.product').update({
            documentId,
            data: {
              //@ts-ignore
              price: parseFloat(price),
              old_price: parseFloat(old_price),
            },
            status: 'published',
          });

          updatedProducts.push(updatedProduct);
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
