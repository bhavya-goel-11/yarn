import type { ProviderAdapter } from './providers/providerAdapter';
import { MockProviderAdapter } from './providers/mockProvider';

const adapters: ProviderAdapter[] = [new MockProviderAdapter()];

export function getProviderAdapters(): ProviderAdapter[] {
  return adapters;
}
