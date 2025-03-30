export default [
  {
    method: 'GET',
    path: '/my-data',
    // name of the controller file & the method.
    handler: 'myController.getData',
    config: {
      policies: [],
    },
  },
];
