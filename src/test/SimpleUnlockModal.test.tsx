import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SimpleUnlockModal } from '../views/components/modal/SimpleUnlockModal';
import { Destination } from '../models/Destination';

const mockDestination: Destination = {
  id: 'ce-jericoacoara',
  name: 'Jericoacoara (Praia da Vila & Lagoa do Paraíso)',
  category: 'Beach',
  region: 'Nordeste',
  stateCode: 'CE',
  isUnlocked: false,
  unlockedColor: '#ef4444',
  photoUrls: [],
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Jericoacoara%2C%20CE%2C%20Brasil',
};

describe('SimpleUnlockModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <SimpleUnlockModal
        isOpen={false}
        destination={mockDestination}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders destination details, maps link, and confirmation button when open for locked destination', () => {
    render(
      <SimpleUnlockModal
        isOpen={true}
        destination={mockDestination}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Jericoacoara/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Praia')).toBeInTheDocument();
    expect(screen.getByText('CE')).toBeInTheDocument();
    expect(screen.getByText(/Destino Bloqueado/i)).toBeInTheDocument();

    // Google Maps accessible link
    const mapsLink = screen.getByRole('link', { name: /google maps/i });
    expect(mapsLink).toBeInTheDocument();
    expect(mapsLink).toHaveAttribute('href', mockDestination.mapsUrl);
    expect(mapsLink).toHaveAttribute('target', '_blank');
    expect(mapsLink).toHaveAttribute('rel', 'noopener noreferrer');

    // Action buttons
    expect(screen.getByRole('button', { name: /liberar destino/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('triggers onConfirm when Liberar Destino button is clicked', async () => {
    const user = userEvent.setup();
    const handleConfirm = vi.fn();

    render(
      <SimpleUnlockModal
        isOpen={true}
        destination={mockDestination}
        onConfirm={handleConfirm}
        onCancel={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /liberar destino/i }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('triggers onCancel when Cancel button is clicked or Escape is pressed', async () => {
    const user = userEvent.setup();
    const handleCancel = vi.fn();

    render(
      <SimpleUnlockModal
        isOpen={true}
        destination={mockDestination}
        onConfirm={vi.fn()}
        onCancel={handleCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(handleCancel).toHaveBeenCalledTimes(1);

    await user.keyboard('{Escape}');
    expect(handleCancel).toHaveBeenCalledTimes(2);
  });

  it('renders unlocked state with photo option when destination is already unlocked', async () => {
    const user = userEvent.setup();
    const handlePhotoUpload = vi.fn();
    const unlockedDest: Destination = { ...mockDestination, isUnlocked: true };

    render(
      <SimpleUnlockModal
        isOpen={true}
        destination={unlockedDest}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        onOpenPhotoUpload={handlePhotoUpload}
      />
    );

    expect(screen.getByText(/Liberado \/ Visitado/i)).toBeInTheDocument();
    const photoBtn = screen.getByRole('button', { name: /adicionar fotos/i });
    expect(photoBtn).toBeInTheDocument();

    await user.click(photoBtn);
    expect(handlePhotoUpload).toHaveBeenCalledWith(unlockedDest);
  });
});
