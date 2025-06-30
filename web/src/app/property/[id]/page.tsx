import PropertyCard from "@/components/PropertyCard";
import InquiryForm from "@/components/InquiryForm";
import { notFound } from 'next/navigation';
import Link from 'next/link';

type Property = {
  id: string;
  name?: string;
  title?: string;
  streetAddress1?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  status?: string;
  imageUrl?: string;
  description?: string;
};

async function getProperty(id: string): Promise<Property | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/${id}`, { cache: 'no-store' });
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error('Failed to fetch property data');
    }
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id);

  if (!property) {
    notFound();
  }

  const propertyName = property.title || property.name || 'Property Details';
  const displayAddress = [property.streetAddress1, property.city, property.state, property.zipcode].filter(Boolean).join(', ');

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-6">
            <Link href="/" className="text-indigo-600 hover:underline">&larr; Back to Listings</Link>
            <h1 className="text-4xl font-extrabold mt-2">{propertyName}</h1>
            <p className="text-lg text-gray-500">{displayAddress}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <PropertyCard property={property} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Make an Inquiry</h2>
            <InquiryForm
              propertyId={property.id}
              propertyTitle={propertyName}
              propertyAddress={displayAddress}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 