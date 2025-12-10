import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContactForm from '../ContactForm';
import { useContactForm } from '../../../hooks/useContactForm';

// Mock the hook
jest.mock('../../../hooks/useContactForm');

describe('ContactForm', () => {
    const mockSubmitForm = jest.fn();
    const mockHandleChange = jest.fn();
    const mockHandleBlur = jest.fn();
    const mockSetKvkkApproved = jest.fn();

    beforeEach(() => {
        (useContactForm as jest.Mock).mockReturnValue({
            formData: {
                name: '',
                email: '',
                phone: '',
                address: '',
                message: '',
            },
            errors: {},
            touched: {},
            kvkkApproved: false,
            setKvkkApproved: mockSetKvkkApproved,
            kvkkError: '',
            setKvkkError: jest.fn(),
            isSubmitting: false,
            handleChange: mockHandleChange,
            handleBlur: mockHandleBlur,
            submitForm: mockSubmitForm,
        });
    });

    it('renders correctly', () => {
        render(<ContactForm />);
        expect(screen.getByText('Bize Mesaj Gönderin')).toBeInTheDocument();
        expect(screen.getByLabelText('Ad Soyad')).toBeInTheDocument();
        expect(screen.getByLabelText('E-posta Adresi')).toBeInTheDocument();
    });

    it('handles form submission', async () => {
        mockSubmitForm.mockResolvedValue(true);
        render(<ContactForm />);

        const submitButton = screen.getByText('Mesaj Gönder');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSubmitForm).toHaveBeenCalled();
        });
    });

    it('displays validation errors', () => {
        (useContactForm as jest.Mock).mockReturnValue({
            ...useContactForm(),
            errors: { name: 'Ad Soyad alanı zorunludur' },
            touched: { name: true },
        });

        render(<ContactForm />);
        expect(screen.getByText('Ad Soyad alanı zorunludur')).toBeInTheDocument();
    });
});
