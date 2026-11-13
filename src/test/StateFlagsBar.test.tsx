import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StateFlagsBar } from '../views/components/map/StateFlagsBar';
import { BrazilMapViewModelContract } from '../viewmodels/useBrazilMapViewModel';
import { Destination } from '../models/Destination';

const createMockViewModel = (
  overrides?: Partial<BrazilMapViewModelContract['state']>,
  actionOverrides?: Partial<BrazilMapViewModelContract['actions']>
): BrazilMapViewModelContract => {
  const defaultDestinations: Record<string, Destination> = {
    'state-SP': {
      id: 'state-SP',
      name: 'São Paulo',
      category: 'State',
      region: 'Sudeste',
      stateCode: 'SP',
      isUnlocked: true,
      unlockedColor: '#f97316',
      photoUrls: [],
    },
    'state-RJ': {
      id: 'state-RJ',
      name: 'Rio de Janeiro',
      category: 'State',
      region: 'Sudeste',
      stateCode: 'RJ',
      isUnlocked: false,
      unlockedColor: '#ea580c',
      photoUrls: [],
    },
  };

  return {
    state: {
      destinations: defaultDestinations,
      selectedStateCode: null,
      displayedDestinations: Object.values(defaultDestinations),
      unlockedStatesCount: 1,
      totalStatesCount: 27,
      progressPercentage: 4,
      isUnlockModalOpen: false,
      pendingDestination: null,
      isPhotoModalOpen: false,
      targetPhotoDestination: null,
      isLoading: false,
      ...overrides,
    },
    actions: {
      handleSelectState: vi.fn(),
      handleRequestUnlock: vi.fn(),
      handleConfirmUnlock: vi.fn().mockResolvedValue(undefined),
      handleCancelUnlock: vi.fn(),
      handleOpenPhotoUpload: vi.fn(),
      handleClosePhotoUpload: vi.fn(),
      handleSavePhoto: vi.fn().mockResolvedValue(undefined),
      handleSavePhotos: vi.fn().mockResolvedValue(undefined),
      handleResetAll: vi.fn().mockResolvedValue(undefined),
      ...actionOverrides,
    },
  };
};

describe('StateFlagsBar component', () => {
  it('renders all 27 Brazilian Federative Unit chips', () => {
    const mockVm = createMockViewModel();
    render(<StateFlagsBar viewModel={mockVm} />);

    expect(screen.getByText(/Bandeiras dos Estados \(Raspadinha\):/i)).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    // At least 27 state flag buttons
    expect(buttons.length).toBeGreaterThanOrEqual(27);
  });

  it('renders official SVG flag when state is unlocked and metallic text when locked', () => {
    const mockVm = createMockViewModel();
    render(<StateFlagsBar viewModel={mockVm} />);

    // SP is unlocked
    const spBtn = screen.getByRole('button', {
      name: /Filtrar destinos de São Paulo \(SP\) - Bandeira oficial liberada/i,
    });
    expect(spBtn).toBeInTheDocument();
    // Check that SVG is inside the SP button
    const spSvg = spBtn.querySelector('svg');
    expect(spSvg).toBeInTheDocument();

    // RJ is locked
    const rjBtn = screen.getByRole('button', {
      name: /Filtrar destinos de Rio de Janeiro \(RJ\) - Bloqueado \(Raspadinha\)/i,
    });
    expect(rjBtn).toBeInTheDocument();
    expect(screen.getByText('RJ')).toBeInTheDocument();
  });

  it('triggers handleSelectState when a state flag chip is clicked', async () => {
    const user = userEvent.setup();
    const handleSelectState = vi.fn();
    const mockVm = createMockViewModel({}, { handleSelectState });

    render(<StateFlagsBar viewModel={mockVm} />);

    const spBtn = screen.getByRole('button', {
      name: /Filtrar destinos de São Paulo \(SP\)/i,
    });
    await user.click(spBtn);

    expect(handleSelectState).toHaveBeenCalledWith('SP');
  });

  it('renders reset filter button when a state is selected and allows clearing', async () => {
    const user = userEvent.setup();
    const handleSelectState = vi.fn();
    const mockVm = createMockViewModel({ selectedStateCode: 'SP' }, { handleSelectState });

    render(<StateFlagsBar viewModel={mockVm} />);

    const clearBtn = screen.getByRole('button', { name: /Limpar filtro de estado/i });
    expect(clearBtn).toBeInTheDocument();

    await user.click(clearBtn);
    expect(handleSelectState).toHaveBeenCalledWith(null);
  });
});
