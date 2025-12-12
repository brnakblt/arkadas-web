import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, NotFound, EmptyState } from '@/components/ui/ErrorBoundary';

describe('ErrorBoundary', () => {
    it('renders children when no error', () => {
        render(
            <ErrorBoundary>
                <div>Test Content</div>
            </ErrorBoundary>
        );
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders error UI when child throws', () => {
        const ThrowError = () => {
            throw new Error('Test error');
        };

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText('Bir Hata Oluştu')).toBeInTheDocument();
        expect(screen.getByText('Tekrar Dene')).toBeInTheDocument();

        consoleSpy.mockRestore();
    });

    it('calls onError when error occurs', () => {
        const ThrowError = () => {
            throw new Error('Test error');
        };
        const onError = vi.fn();
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(
            <ErrorBoundary onError={onError}>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(onError).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});

describe('NotFound', () => {
    it('renders with default message', () => {
        render(<NotFound />);
        expect(screen.getByText('Sayfa bulunamadı')).toBeInTheDocument();
        expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('renders with custom message', () => {
        render(<NotFound message="Özel mesaj" />);
        expect(screen.getByText('Özel mesaj')).toBeInTheDocument();
    });
});

describe('EmptyState', () => {
    it('renders with default props', () => {
        render(<EmptyState />);
        expect(screen.getByText('Veri bulunamadı')).toBeInTheDocument();
    });

    it('renders with custom props', () => {
        render(
            <EmptyState
                icon="🎉"
                title="Özel Başlık"
                description="Özel açıklama"
                action={<button>Eylem</button>}
            />
        );
        expect(screen.getByText('🎉')).toBeInTheDocument();
        expect(screen.getByText('Özel Başlık')).toBeInTheDocument();
        expect(screen.getByText('Özel açıklama')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Eylem' })).toBeInTheDocument();
    });
});
