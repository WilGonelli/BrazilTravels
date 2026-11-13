import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PhotoManagerModal } from '../views/components/modal/PhotoManagerModal';
import { TravelPhoto } from '../models/TravelPhoto';

const mockPhotos: TravelPhoto[] = [
  {
    id: 'photo-1',
    destinationId: 'sp-ubatuba-felix',
    destinationName: 'Praia do Félix',
    stateCode: 'SP',
    imageUrl: 'https://example.com/felix.webp',
    createdAt: '2026-11-13',
  },
  {
    id: 'photo-2',
    destinationId: 'pe-noronha-sancho',
    destinationName: 'Baía do Sancho',
    stateCode: 'PE',
    imageUrl: 'https://example.com/sancho.webp',
    createdAt: '2026-11-13',
  },
];

describe('PhotoManagerModal component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <PhotoManagerModal
        isOpen={false}
        photos={mockPhotos}
        onClose={vi.fn()}
        onDeletePhoto={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders photos grid and close button when open', () => {
    render(
      <PhotoManagerModal
        isOpen={true}
        photos={mockPhotos}
        onClose={vi.fn()}
        onDeletePhoto={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/gerenciar fotos registradas/i)).toBeInTheDocument();
    expect(screen.getByText('2 fotos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fechar gerenciador de fotos/i })).toBeInTheDocument();
  });

  it('opens confirmation sub-dialog on photo delete button click, and cancels', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <PhotoManagerModal
        isOpen={true}
        photos={mockPhotos}
        onClose={vi.fn()}
        onDeletePhoto={onDelete}
      />
    );

    // Click delete on first photo
    const deleteBtn = screen.getByRole('button', { name: /remover foto de praia do félix/i });
    await user.click(deleteBtn);

    // Confirmation dialog appears
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/confirmar exclusão/i)).toBeInTheDocument();

    // Cancel deletion
    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelBtn);

    // Confirmation closed, delete was not called, modal remains open
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('confirms photo deletion without closing main gallery modal', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <PhotoManagerModal
        isOpen={true}
        photos={mockPhotos}
        onClose={onClose}
        onDeletePhoto={onDelete}
      />
    );

    // Click delete on first photo
    const deleteBtn = screen.getByRole('button', { name: /remover foto de praia do félix/i });
    await user.click(deleteBtn);

    // Confirm deletion
    const confirmBtn = screen.getByRole('button', { name: /excluir foto/i });
    await user.click(confirmBtn);

    expect(onDelete).toHaveBeenCalledWith('photo-1');
    // Main modal stays open, onClose was not called!
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('calls onClose only when modal header X button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <PhotoManagerModal
        isOpen={true}
        photos={mockPhotos}
        onClose={onClose}
        onDeletePhoto={vi.fn()}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /fechar gerenciador de fotos/i });
    await user.click(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('filters photos by search query and toggles favorite', async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn().mockResolvedValue(undefined);

    render(
      <PhotoManagerModal
        isOpen={true}
        photos={mockPhotos}
        onClose={vi.fn()}
        onDeletePhoto={vi.fn()}
        onToggleFavorite={onToggleFavorite}
      />
    );

    // Toggle favorite
    const favBtn = screen.getByRole('button', { name: /marcar foto de praia do félix como favorita/i });
    await user.click(favBtn);
    expect(onToggleFavorite).toHaveBeenCalledWith('photo-1');

    // Filter by destination name
    const searchInput = screen.getByRole('textbox', { name: /filtrar fotos cadastradas/i });
    await user.type(searchInput, 'Sancho');

    expect(screen.queryByText(/praia do félix/i)).toBeNull();
    expect(screen.getByText(/baía do sancho/i)).toBeInTheDocument();
  });
});
