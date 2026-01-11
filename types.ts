
export interface DataPoint {
  x: number;
  y: number;
}

export interface FunctionInsight {
  name: string;
  domain: string;
  range: string;
  behavior: string;
  realWorldApplications: string[];
  latex: string;
}

export enum CalculationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
