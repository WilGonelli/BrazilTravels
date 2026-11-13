import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DestinationSearchBar } from '../views/components/search/DestinationSearchBar';
import { BrazilMapViewModelContract } from '../viewmodels/useBrazilMapViewModel';
import { Destination } from '../models/Destination';

const mockDestination: Destination = {
  id: 'sp-ubatuba-felix',
  name: 'Praia do Félix (Ubatuba)',
  category: 'Beach',
  region: 'Sudeste',
  stateCode: 'SP',
  isUnlocked: false,
  unlockedColor: '#22c55e',
  photoUrls: [],
};

const createMockViewModel = (
  searchQuery = '',
  searchResults: readonly Destination[] = []
): BrazilMapViewModelContract => {
  return {
    state: {
      destinations: { [mockDestination.id]: mockDestination },
      selectedStateCode: null,
      displayedDestinations: [],
      unlockedStatesCount: 0,
      totalStatesCount: 27,
      progressPercentage: 0,
      unlockedPointsCount: 0,
      totalPointsCount: 50,
      pointsProgressPercentage: 0,
      searchQuery,
      searchResults,
      isUnlockModalOpen: false,
      pendingDestination: null,
      isPhotoModalOpen: false,
      targetPhotoDestination: null,
      isLoading: false,
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
      handleSearchChange: vi.fn(),
      handleClearSearch: vi.fn(),
      handleSelectSearchResult: vi.fn(),
      handleResetAll: vi.fn().mockResolvedValue(undefined),
    },
  };
};

describe('DestinationSearchBar component', () => {
  it('renders accessible search combobox with placeholder', () => {
    const vm = createMockViewModel();
    render(<DestinationSearchBar viewModel={vm} />);

    const input = screen.getByRole('combobox', { name: /buscar destinos turísticos do brasil/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Buscar praias, cachoeiras, cidades...');
  });

  it('triggers handleSearchChange on user input', async () => {
    const user = userEvent.setup();
    const vm = createMockViewModel();
    render(<DestinationSearchBar viewModel={vm} />);

    const input = screen.getByRole('combobox', { name: /buscar destinos turísticos do brasil/i });
    await user.type(input, 'felix');

    expect(vm.actions.handleSearchChange).toHaveBeenCalled();
  });

  it('renders autocomplete suggestions dropdown and triggers selection', async () => {
    const user = userEvent.setup();
    const vm = createMockViewModel('felix', [mockDestination]);
    render(<DestinationSearchBar viewModel={vm} />);

    const listbox = screen.getByRole('listbox', { name: /destinos encontrados/i });
    expect(listbox).toBeInTheDocument();

    const option = screen.getByRole('option', { name: /praia do félix \(ubatuba\)/i });
    expect(option).toBeInTheDocument();

    await user.click(option);
    expect(vm.actions.handleSelectSearchResult).toHaveBeenCalledWith(mockDestination);
  });

  it('allows clearing search via clear button', async () => {
    const user = userEvent.setup();
    const vm = createMockViewModel('felix', [mockDestination]);
    render(<DestinationSearchBar viewModel={vm} />);

    const clearBtn = screen.getByRole('button', { name: /limpar campo de busca/i });
    expect(clearBtn).toBeInTheDocument();

    await user.click(clearBtn);
    expect(vm.actions.handleClearSearch).toHaveBeenCalled();
  });
});
