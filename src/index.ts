export * from './components';

export type SimpleDNDTableData = {
  key: number | string;
  values: string[];
  inner?: SimpleDNDTableData[];
}
