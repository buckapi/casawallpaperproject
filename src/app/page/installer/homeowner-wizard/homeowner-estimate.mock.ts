/**
 * Presentation fixture for H11.
 *
 * This is deliberately not a pricing engine. The real matrix/provider can
 * later return the same model with source: 'real' without changing H11.
 */
export interface HomeownerInstallationEstimate {
  source: 'mock' | 'real';
  statusLabel: string;
  laborAmountLabel: string;
  basisLabel: string;
  disclaimer: string;
}

export const mockBaseInstallationEstimate:
  HomeownerInstallationEstimate = {
    source: 'mock',
    statusLabel: 'Preliminary',
    laborAmountLabel: '—',
    basisLabel: 'Based on the measurements provided.',
    disclaimer: 'Wall conditions and wallpaper details may change this estimate.'
  };

/** Presentation-only fixture used by H13. It must be replaced by the
 * pricing provider in the later pricing-integration phase. */
export interface InstallationEstimateViewModel {
  source: 'mock' | 'real';
  spaceLabel: string;
  laborLabel: string;
  adjustments: Array<{ label: string; amountLabel: string }>;
  currentEstimateLabel: string;
  pendingAdjustments: string[];
}

export const mockInstallationEstimate: InstallationEstimateViewModel = {
  source: 'mock',
  spaceLabel: 'Bedroom · Installation labor',
  laborLabel: 'Base installation',
  adjustments: [{ label: 'Wall height adjustment', amountLabel: '+$80' }],
  currentEstimateLabel: '$780',
  pendingAdjustments: ['Pending: wallpaper width. +$100 if wider than 36 inches. Not added yet.']
};
