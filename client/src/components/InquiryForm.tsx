import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from 'hooks/useApi';
import { toast } from 'react-toastify';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';

interface InquiryFormProps {
    propertyId?: string;
    onSuccess?: () => void;
}

const InquiryForm: React.FC<InquiryFormProps> = ({ propertyId: propPropertyId, onSuccess }) => {
    const { propertyId: paramPropertyId } = useParams<{ propertyId: string }>();
    const propertyId = propPropertyId || paramPropertyId;

    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const { request } = useApi();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Basic sanitization: remove dangerous characters
    const sanitize = (str: string) => str.replace(/[<>"'`;\\]/g, '').trim();

    const validate = () => {
        const errs: typeof errors = {};
        if (!formData.name.trim()) errs.name = 'Name is required.';
        else if (!/^[a-zA-Z\s'-]{2,50}$/.test(formData.name)) errs.name = 'Name must be 2-50 letters.';
        if (!formData.email.trim()) errs.email = 'Email is required.';
        else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errs.email = 'Invalid email address.';
        if (!formData.message.trim()) errs.message = 'Message is required.';
        else if (formData.message.length < 10) errs.message = 'Message must be at least 10 characters.';
        return errs;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!propertyId) {
            toast.error("Property ID is missing.");
            return;
        }
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        // Sanitize all fields
        const safeData = {
            name: sanitize(formData.name),
            email: sanitize(formData.email),
            message: sanitize(formData.message),
            propertyId: sanitize(propertyId)
        };

        try {
            setIsLoading(true);
            await request('/inquiries', {
                method: 'POST',
                body: JSON.stringify(safeData),
                errorMessage: "Failed to submit inquiry. Please try again."
            });
            toast.success('Inquiry submitted successfully!');
            setFormData({ name: '', email: '', message: '' });
            setErrors({});
            if (typeof onSuccess === 'function') onSuccess();
        } catch (error) {
            // The useApi hook already shows the error toast.
            // You can add additional error handling here if needed.
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center text-gray-800">Contact an Agent</h2>
            <Input
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
            />
            {errors.name && <div className="text-red-500 text-xs mb-2">{errors.name}</div>}
            <Input
                name="email"
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
            />
            {errors.email && <div className="text-red-500 text-xs mb-2">{errors.email}</div>}
            <Textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
            />
            {errors.message && <div className="text-red-500 text-xs mb-2">{errors.message}</div>}
            <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Submitting...' : 'Submit Inquiry'}
            </Button>
        </form>
    );
};

export default InquiryForm;
