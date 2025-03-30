import type { PanelComponent, PanelComponentProps } from '@strapi/content-manager/strapi-admin';

const Panel: PanelComponent = ({
  activeTab,
  collectionType,
  document,
  documentId,
  meta,
  model,
}: PanelComponentProps) => {
  return {
    title: 'My Panel',
    content: <p>I'm on {activeTab}</p>,
  };
};
