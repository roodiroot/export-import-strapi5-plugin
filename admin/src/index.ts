import { getTranslation } from './utils/getTranslation';
import { PLUGIN_ID } from '../../pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';
import { DownloadButton } from './components/import/DownloadButton';
import { UploadButton } from './components/import/UploadButton';
import { Alerts } from './components/injected/Alerts';

export default {
  register(app: any) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: PLUGIN_ID,
      },
      Component: async () => {
        const { App } = await import('./pages/App');

        return App;
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  bootstrap(app: any) {
    // Добавляем алерты на страницу списка
    app.getPlugin('content-manager').injectComponent('listView', 'actions', {
      name: `${PLUGIN_ID}-alerts`,
      Component: Alerts,
    });
    // Добавляем кнопу "Импорт" в интерфейс управления контентом
    app.getPlugin('content-manager').injectComponent('listView', 'actions', {
      name: `${PLUGIN_ID}-import`,
      Component: DownloadButton,
    });

    // Добавляем кнопку "Экспорт" в интерфейс управления контентом
    app.getPlugin('content-manager').injectComponent('listView', 'actions', {
      name: `${PLUGIN_ID}-export`,
      Component: UploadButton,
    });
  },
};
