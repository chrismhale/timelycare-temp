import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from 'hooks/useApi';
import InquiryForm from '@/components/InquiryForm';
import Button from '@/components/ui/Button';
import PageTransition from '@/components/PageTransition';
import Footer from '@/components/Footer';

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { request } = useApi();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const res = await request(`/properties/${id}`);
        setProperty(res?.data ?? res);
      } catch (err) {
        setError('Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, request]);

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-10">{error}</div>;
  if (!property) return <div className="text-center p-10">Property not found.</div>;

  return (
    <PageTransition>
      {/* Hero image */}
      <section className="w-full h-72 bg-cover bg-center" style={{ backgroundImage: `url('${property.imageUrl || 'https://placehold.co/1200x500?text=No+Image'}')` }}>
        <div className="w-full h-full bg-black/40 flex items-end">
          <div className="container mx-auto px-4 pb-6">
            <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">{property.title ?? property.name}</h1>
          </div>
        </div>
      </section>

      {/* Details Card */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white shadow-lg rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-2xl font-bold text-indigo-600">${property.price?.toLocaleString?.() ?? property.price}</span>
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm capitalize">{property.status}</span>
            </div>
            {(() => {
              const sa1 = property.streetAddress1;
              const sa2 = property.streetAddress2;
              const city = property.city;
              const state = property.state;
              const zipcode = property.zipcode;
              const hasNewAddress = sa1 || sa2 || city || state || zipcode;
              const displayAddress = hasNewAddress
                ? [sa1, sa2, city, state, zipcode].filter(Boolean).join(', ')
                : property.address;
              return <p className="text-gray-700"><strong>Address:</strong> {displayAddress}</p>;
            })()}
            <p className="text-gray-700"><strong>Bedrooms:</strong> {property.bedrooms}</p>
            <p className="text-gray-700"><strong>Bathrooms:</strong> {property.bathrooms}</p>
            {property.description && <p className="text-gray-600 whitespace-pre-line">{property.description}</p>}
          </div>

          {/* CTA / Inquiry */}
          <div className="border rounded-lg p-4 bg-gray-50 h-fit">
            <InquiryForm propertyId={property.id} />
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-sm text-gray-600">
          <Link to="/" className="hover:underline">&larr; Back to Listings</Link>
        </div>
      </div>

      <Footer />
    </PageTransition>
  );
};

export default PropertyDetails; 