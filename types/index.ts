interface EntityFieldConfig {
  fields?: string[] | [];
}

export interface ConfigData {
  entities: {
    [key: string]: EntityFieldConfig;
  };
}
