// import contentAPIRoutes from './content-api';

// const routes = {
//   'content-api': {
//     type: 'content-api',
//     routes: contentAPIRoutes,
//   },
// };

// export default routes;

export default {
  admin: {
    type: 'admin',
    routes: [
      {
        method: 'POST',
        path: '/export-csv',
        handler: 'myController.getData',
        config: {
          policies: [],
          // auth: false,
        },
      },
      {
        method: 'POST',
        path: '/import-csv',
        handler: 'myController.updateData',
        config: {
          policies: [],
          // auth: false,
        },
      },
    ],
  },
};
