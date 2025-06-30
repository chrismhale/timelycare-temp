"use client";

import React, { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import Button from './ui/Button';
import Input from './ui/Input';
import Textarea from './ui/Textarea';

interface InquiryFormProps {
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  onSuccess?: () => void;
}

const InquiryForm: React.FC<InquiryFormProps> = ({ propertyId, propertyTitle, propertyAddress, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { request } = useApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await request('/inquiries', {
      method: 'POST',
      body: JSON.stringify({ name, email, message, propertyId }),
      successMessage: 'Inquiry submitted!',
    });
    setSubmitted(true);
    if (onSuccess) onSuccess();
  };

  if (submitted) {
    return (
      <div className="p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
        <p className="font-bold">Thank you!</p>
        <p>Your inquiry has been sent. An agent will contact you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <div className="text-center mb-4 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Contact an Agent</h2>
          <p className="text-sm text-gray-500 mt-1">Regarding: <span className="font-semibold">{propertyTitle}</span></p>
          <p className="text-xs text-gray-400">{propertyAddress}</p>
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium">Name</label>
        <Input id="name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <Input id="email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium">Message</label>
        <Textarea id="message" value={message} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)} required />
      </div>
      <Button type="submit">Submit Inquiry</Button>
    </form>
  );
};

export default InquiryForm; 