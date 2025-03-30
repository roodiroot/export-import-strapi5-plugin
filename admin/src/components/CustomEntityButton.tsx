import React from 'react';
import { Button } from '@strapi/design-system';
import { useIntl } from 'react-intl';

export const CustomEntityButton = ({ entityId, entitySlug }: any) => {
  const { formatMessage } = useIntl();

  const handleClick = () => {
    console.log('Clicked on entity:', entityId, entitySlug);
    // Ваша логика здесь
  };

  return (
    <Button variant="secondary" onClick={handleClick}>
      {formatMessage({
        id: 'export-import.custom-button',
        defaultMessage: 'Custom Action',
      })}
    </Button>
  );
};
