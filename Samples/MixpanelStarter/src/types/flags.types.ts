export interface MixpanelFlagVariant {
  key: string;
  value: any;
  experimentID?: string;
  isExperimentActive?: boolean;
  isQATester?: boolean;
}

export interface TestResult {
  id: string;
  timestamp: Date;
  method: string;
  flagName: string;
  fallback: any;
  result: any;
  resultType: string;
  executionTime: number;
  usedFallback: boolean;
  error?: string;
}

export interface TrackedEvent {
  id: string;
  timestamp: Date;
  eventName: string;
  properties: Record<string, any>;
}

export type TestMode = 'sync' | 'async' | 'edge' | 'coercion';

export type ValueType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' | 'undefined';

export interface FlagInfo {
  key: string;
  value: any;
  valueType: ValueType;
  variantKey: string;
  experimentID?: string;
  isExperimentActive?: boolean;
  isQATester?: boolean;
  lastAccessed?: Date;
}
