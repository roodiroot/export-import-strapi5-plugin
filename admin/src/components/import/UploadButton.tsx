import { useEffect, useState } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';
import { CheckCircle, File as IconFile, Upload } from '@strapi/icons';
import { Modal, Button, Typography, Flex, Box, Loader } from '@strapi/design-system';
import { unstable_useContentManagerContext as useContentManagerContext } from '@strapi/strapi/admin';

import { PLUGIN_ID } from '../../../../pluginId';
import { useAlerts } from '../../hooks/useAlerts';
import { getConfig } from '../../../src/api/config';

import styled from 'styled-components';

const LoaderWrapper = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.05); /* Полупрозрачный белый фон */
  backdrop-filter: blur(2px); /* Лёгкое размытие */
`;
const Label = styled.label`
  --hover-color: hsl(210, 100%, 50%);
  --success-color: hsl(133, 65.3%, 48.6%) position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  flex: 1;
  height: 260px;
  padding: 48px;
  border-width: 3px;
  border-color: #ddd;
  border-radius: 12px;
  cursor: pointer;
  border-style: dashed;
  text-align: center;
  &:hover {
    border-color: var(--hover-color);
  }

  .success_add_file_for_input {
    color: var(--success-color);
  }

  & > *:not(:first-child) {
    margin-top: 16px;
  }

  input {
    display: none;
  }
`;
const DragOverLabel = styled(Label)`
  &.dragged-over {
    border-color: var(--hover-color);

    &::after {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 5;
    }
  }
`;
const IconWrapper = styled.span`
  height: 100px;
  svg {
    width: 6rem;
    height: 6rem;
    color: #c0c0cf;
  }
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const UploadButton = () => {
  const { notify } = useAlerts();
  const { post } = useFetchClient();
  const { model } = useContentManagerContext();
  const [entities, setEntities] = useState<string[] | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<{ name: string; size: number } | null>(null);
  const [data, setData] = useState<string | ArrayBuffer | null>('');

  const [uploadSuccessful, setUploadSuccessful] = useState(false);
  const [uploadingData, setUploadingData] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      const configData = await getConfig();
      const configModels = Object.keys(configData);
      setEntities(configModels);
    };

    fetchConfig();
  }, []);

  if (!entities) return null;
  if (!entities?.includes(model)) return null;

  const uploadData = async () => {
    if (!file) return;

    setUploadingData(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('modelName', model);
    try {
      const response = await post(`/${PLUGIN_ID}/import-csv`, formData);
      if (response.data.success && response.data.updated) {
        setUploadingData(false);
        setUploadSuccessful(true);
        setFileName(null);
        setFile(null);
        setData(null);
        notify(
          'Great!',
          'Import completed: ' + response.data.updated + ' products updated.',
          'success'
        );
      } else {
        notify('Error!', 'Error updating data.', 'error');
        setUploadingData(false);
      }
    } catch (error) {
      notify('Error!', 'Error uploading CSV.', 'error');
      setUploadingData(false);
    }
  };
  const onReadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      readFile(file);
    }
  };
  const readFile = (file: File) => {
    if (file.type === 'text/csv' || /\.csv$/i.test(file.name)) {
      const reader = new FileReader();
      reader.readAsText(file);

      reader.onload = () => {
        // console.log('Содержимое файла:', reader.result);
        setFile(file);
        setData(reader.result);
        setFileName({ name: file.name, size: file.size });
      };

      reader.onerror = () => {
        setFile(null);
        setData(null);
        // console.error('Ошибка чтения файла', reader.error);
        notify('Error', `File reader error.`, 'error');
      };
    } else {
      setData(null);
      setFileName(null);
      setFile(null);
      notify('Error', `File type ${file.type} not supported.`, 'error');
      throw new Error(`File type ${file.type} not supported.`);
    }
  };
  const resetDataSource = () => {
    setData('');
    setFile(null);
    setFileName(null);
  };
  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    // console.log('ЕЛЕМЕНТ ВХОДИТ В ОБЛАСТЬ');
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    // console.log('Файл над областью');
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragLeave = () => {
    // console.log('Файл покинул область');
  };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleDragLeave();
    const file = e.dataTransfer.files[0];
    readFile(file);
    // console.log('Файлы загружены:', file);
  };

  const showLoader = uploadingData;
  const showEditor = !uploadingData && !uploadSuccessful && data;
  const showFileDragAndDrop = !uploadSuccessful;
  const showUploadSuccessfull = uploadSuccessful;

  const showImportButton = showEditor;
  const showRemoveFileButton = showEditor;

  return (
    <Modal.Root>
      <Modal.Trigger>
        <Button startIcon={<Upload />}>Import</Button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>
            <Typography
              fontWeight="bold"
              textColor="neutral800"
              as="p"
              style={{ marginBottom: '16px' }}
            >
              Import
            </Typography>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showFileDragAndDrop && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <Typography variant="beta" textColor="neutral800">
                  Drag or upload a file in CSV format.
                </Typography>
              </div>
              <DragOverLabel
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <IconWrapper>
                  <IconFile />
                </IconWrapper>
                <Typography variant="delta" textColor="neutral600">
                  {fileName ? (
                    <div style={{ color: 'hsl(133, 65.3%, 48.6%)' }}>
                      <div>{fileName.name}</div>
                      <div style={{ fontSize: '14px' }}>
                        {(fileName.size / 1024).toFixed(2) + 'KB'}
                      </div>
                    </div>
                  ) : (
                    'Import file .csv'
                  )}
                </Typography>
                <input type="file" accept=".csv,.json" hidden onChange={onReadFile} />
              </DragOverLabel>
            </>
          )}
          {showUploadSuccessfull && (
            <Flex direction="column" alignItems="center" gap={4}>
              <Box paddingBottom={4}>
                <CheckCircle width="6rem" height="6rem" color="success500" />
              </Box>
              <Typography variant="beta" textColor="neutral800">
                Data successfully imported into the database.
              </Typography>
              <Box paddingTop={4}>
                <Modal.Trigger>
                  <Button onClick={() => setUploadSuccessful(false)} variant="tertiary">
                    Close window
                  </Button>
                </Modal.Trigger>
              </Box>
            </Flex>
          )}
          {showLoader && (
            <>
              <LoaderWrapper>
                <Loader>Loading...</Loader>
              </LoaderWrapper>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {showImportButton && <Button onClick={uploadData}>Import</Button>}
          {showRemoveFileButton && (
            <Button onClick={resetDataSource} variant="tertiary">
              Delete file
            </Button>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};
