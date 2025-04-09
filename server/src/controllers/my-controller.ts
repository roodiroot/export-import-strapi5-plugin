import fs from 'fs';
import csv from 'csv-parser';
import type { Core } from '@strapi/strapi';
import { Parser } from 'json2csv';

const myController = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getData(ctx) {
    const { data } = ctx.request.body;

    // const frontendFilters = data?.filters || undefined;
    const _q = data?._q || undefined;

    const baseFilter = {
      publishedAt: {
        $notNull: true,
      },
    };

    // Объединяем фильтры
    let finalFilters = { ...baseFilter };

    // if (frontendFilters) {
    //   finalFilters = {
    //     ...frontendFilters,
    //   };
    // }

    console.log(
      '%c Start download!',
      'color: red; background: yellow; font-size: 16px; padding: 5px;'
    );

    const products = await strapi.db.query('api::product.product').findMany({
      where: finalFilters,
      populate: { brand: true, category: true },
      _q,
    });

    console.log(
      '%c Finish download!',
      'color: red; background: yellow; font-size: 16px; padding: 5px;'
    );

    // Определяем нужные поля для CSV
    const fields = [
      'documentId',
      'category.name',
      'brand.name',
      'name',
      'slug',
      'price',
      'sale',
      'hit',
      'available',
      'popularity',
    ];

    // Преобразуем данные в CSV
    const csv = new Parser({ fields }).parse(products);

    console.log('%c Update CSV!', 'color: red; background: yellow; font-size: 16px; padding: 5px;');

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
        const { price, name, documentId, sale, available, hit } = row;

        if (documentId) {
          // Создаем пустой объект для данных
          const data: Record<string, any> = {};

          // Добавляем только те поля, которые существуют и имеют значение
          if (price !== undefined && price !== null && price !== '') {
            data.price = parseFloat(price);
          }

          // есди пользователь поменял имя
          if (name !== undefined && name !== null && name !== '') {
            data.name = name.trim();
          }

          //если пользователь поменял доступность товара
          if (available.toLowerCase() === 'true') {
            data.available = true;
          } else if (available.toLowerCase() === 'false') {
            data.available = false;
          }

          if (hit.toLowerCase() === 'true') {
            console.log('это хит на');
            data.hit === true;
          }

          // если пользователь добавил скидку
          if (sale && !isNaN(parseInt(sale))) {
            data.sale = parseInt(sale);
          }

          // Проверяем, есть ли данные для обновления
          if (Object.keys(data).length > 0) {
            const updatedProduct = await strapi.documents('api::product.product').update({
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
