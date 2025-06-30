import React, { useEffect, useState, useRef } from "react";
import { useFetchState } from "hooks/useFetchState";
import { useApi } from "hooks/useApi";
import PropertyCard from "@/components/PropertyCard";
import PageTransition from "@/components/PageTransition";
import Modal from '@/components/Modal';
import InquiryForm from '@/components/InquiryForm';
import Footer from '@/components/Footer';

type SortKey = 'title' | 'address' | 'price' | 'bedrooms' | 'bathrooms' | 'status';

type Property = {
  id: string;
  title?: string;
  name?: string;
  streetAddress1?: string;
  streetAddress2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  address?: string;
  location?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  status?: string;
  imageUrl?: string;
  description?: string;
};

type Inquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  propertyId: string;
  createdAt?: string;
};

const PublicListings = () => {
  const { data: properties, isLoading, error, setData, setError, setLoading } = useFetchState<Property[]>([]);
  const { request } = useApi();
  const [filters, setFilters] = useState<{
    minPrice: string;
    maxPrice: string;
    minBedrooms: string;
    location: string;
  }>(() => {
    const stored = localStorage.getItem('publicFilters');
    return stored ? JSON.parse(stored) : {
      minPrice: '',
      maxPrice: '',
      minBedrooms: '',
      location: '',
    };
  });
  const didFetch = useRef(false);
  const [modalProperty, setModalProperty] = useState<{ id: string; title: string; address: string } | null>(null);
  const [view, setView] = useState<'cards' | 'table'>(() => {
    const stored = localStorage.getItem('publicView');
    return stored === 'table' ? 'table' : 'cards';
  });
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(() => {
    const stored = localStorage.getItem('publicSort');
    return stored ? JSON.parse(stored) : null;
  });

  const priceOptions = [
    '', '100000', '200000', '300000', '400000', '500000', '600000', '700000', '800000', '900000', '1000000', '1500000', '2000000'
  ];
  const bedroomOptions = ['', '1', '2', '3', '4', '5+'];

  useEffect(() => {
    if (didFetch.current) return; // avoid duplicate calls (e.g., StrictMode)
    didFetch.current = true;

    const fetchListings = async () => {
      setLoading(true);
      try {
        const data = await request('/properties');
        setData(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
    // intentionally empty dependency array to run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('publicFilters', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem('publicView', view);
  }, [view]);

  useEffect(() => {
    if (sortConfig) {
      localStorage.setItem('publicSort', JSON.stringify(sortConfig));
    } else {
      localStorage.removeItem('publicSort');
    }
  }, [sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' };
      // toggle
      return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  const getSortVal = (prop: any, key: SortKey) => {
    switch (key) {
      case 'title':
        return prop.name ?? prop.title ?? '';
      case 'address':
        return [
          prop.streetAddress1,
          prop.streetAddress2,
          prop.city,
          prop.state,
          prop.zipcode
        ].filter(Boolean).join(', ') || prop.address || prop.location || '';
      default:
        return prop[key] ?? '';
    }
  };

  // Filter logic
  const filteredProperties: Property[] = Array.isArray(properties)
    ? properties.filter((p: Property) => {
        const price = Number(p.price);
        const bedrooms = Number(p.bedrooms);
        const matchesPrice =
          (!filters.minPrice || price >= Number(filters.minPrice)) &&
          (!filters.maxPrice || price <= Number(filters.maxPrice));
        const matchesBedrooms =
          !filters.minBedrooms || bedrooms >= Number(filters.minBedrooms);
        const locationQuery = filters.location.trim().toLowerCase();
        const matchesLocation =
          !locationQuery ||
          [
            p.location,
            p.address,
            p.city,
            p.state,
            p.zipcode
          ]
            .filter(Boolean)
            .some(val => String(val).toLowerCase().includes(locationQuery));
        return matchesPrice && matchesBedrooms && matchesLocation;
      })
    : [];

  if (isLoading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-10">{error}</div>;
  }

  // Defensive: if properties is not an array, show error
  if (!Array.isArray(properties)) {
    return (
      <div className="text-red-500 text-center p-10">
        Error: Unexpected data format from server. Please try again later.
      </div>
    );
  }

  return (
    <PageTransition>
      {/* Hero / Banner */}
      <section
        className="w-full h-64 bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=80')" }}
      >
        <div className="bg-black bg-opacity-50 rounded px-6 py-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
            Find Your Dream Home
          </h2>
          <p className="text-gray-200 text-center mt-2 max-w-2xl">
            Browse through a curated list of properties and discover the perfect place that matches all of your criteria.
          </p>
        </div>
      </section>

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Explore Our Listings</h1>
        {/* Filter Bar */}
        <form className="flex flex-wrap gap-4 mb-6 items-end justify-center bg-gray-50 p-4 rounded shadow">
          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium">Min Price</label>
            <select
              id="minPrice"
              className="border rounded px-2 py-1 w-32"
              value={filters.minPrice}
              onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
            >
              <option value="">No Min</option>
              {priceOptions.slice(1).map(p => (
                <option key={p} value={p}>{`$${Number(p).toLocaleString()}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium">Max Price</label>
            <select
              id="maxPrice"
              className="border rounded px-2 py-1 w-32"
              value={filters.maxPrice}
              onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
            >
              <option value="">No Max</option>
              {priceOptions.slice(1).map(p => (
                <option key={p} value={p}>{`$${Number(p).toLocaleString()}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="minBedrooms" className="block text-sm font-medium">Bedrooms</label>
            <select
              id="minBedrooms"
              className="border rounded px-2 py-1 w-28"
              value={filters.minBedrooms}
              onChange={e => setFilters(f => ({ ...f, minBedrooms: e.target.value }))}
            >
              <option value="">Any</option>
              {bedroomOptions.slice(1).map(b => (
                <option key={b} value={b}>{b}+</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium">Location</label>
            <input
              id="location"
              type="text"
              className="border rounded px-2 py-1 w-40"
              value={filters.location}
              onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
              placeholder="City, address..."
            />
          </div>
          <button
            type="button"
            className="ml-2 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
            onClick={() => setFilters({ minPrice: '', maxPrice: '', minBedrooms: '', location: '' })}
          >
            Clear All
          </button>
        </form>
        <div className="flex justify-end items-center mb-2 gap-2">
          <button
            className={`p-2 rounded ${view === 'cards' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
            onClick={() => setView('cards')}
            title="Card View"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/></svg>
          </button>
          <button
            className={`p-2 rounded ${view === 'table' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
            onClick={() => setView('table')}
            title="Table View"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 10h18M3 14h18M7 6v12"/></svg>
          </button>
        </div>
        {filteredProperties.length === 0 && (
          <p className="text-center">No properties match your filters. Please try different criteria.</p>
        )}
        {view === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property: Property) => {
              const name = property.name ?? property.title ?? 'Untitled';
              const price = property.price ?? 0;
              const bedrooms = property.bedrooms ?? 0;
              const bathrooms = property.bathrooms ?? 0;
              return (
                <PropertyCard
                  key={property.id}
                  {...property}
                  name={name}
                  price={price}
                  bedrooms={bedrooms}
                  bathrooms={bathrooms}
                  onInquire={({ id, title, address }) => setModalProperty({
                    id,
                    title: title || name,
                    address: address || ''
                  })}
                />
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th onClick={() => handleSort('title')} title="Sort" className="cursor-pointer px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none">Title {sortConfig?.key==='title' ? (sortConfig.direction==='asc'?'▲':'▼') : '⇅'}</th>
                  <th onClick={() => handleSort('address')} title="Sort" className="cursor-pointer px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none">Address {sortConfig?.key==='address' ? (sortConfig.direction==='asc'?'▲':'▼') : '⇅'}</th>
                  <th onClick={() => handleSort('price')} title="Sort" className="cursor-pointer px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none">Price {sortConfig?.key==='price' ? (sortConfig.direction==='asc'?'▲':'▼') : '⇅'}</th>
                  <th onClick={() => handleSort('bedrooms')} title="Sort" className="cursor-pointer px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none">Beds {sortConfig?.key==='bedrooms' ? (sortConfig.direction==='asc'?'▲':'▼') : '⇅'}</th>
                  <th onClick={() => handleSort('bathrooms')} title="Sort" className="cursor-pointer px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none">Baths {sortConfig?.key==='bathrooms' ? (sortConfig.direction==='asc'?'▲':'▼') : '⇅'}</th>
                  <th onClick={() => handleSort('status')} title="Sort" className="cursor-pointer px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none">Status {sortConfig?.key==='status' ? (sortConfig.direction==='asc'?'▲':'▼') : '⇅'}</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {(() => {
                  const list = [...filteredProperties];
                  if (sortConfig) {
                    list.sort((a: Property, b: Property) => {
                      const { key, direction } = sortConfig;
                      const valA = getSortVal(a, key);
                      const valB = getSortVal(b, key);
                      let cmp = 0;
                      if (typeof valA === 'number' && typeof valB === 'number') cmp = valA - valB;
                      else cmp = String(valA).localeCompare(String(valB));
                      return direction === 'asc' ? cmp : -cmp;
                    });
                  }
                  return list;
                })().map((prop: Property) => {
                  const displayName: string = prop.name ?? prop.title ?? 'Untitled';
                  const address = [
                    prop.streetAddress1,
                    prop.streetAddress2,
                    prop.city,
                    prop.state,
                    prop.zipcode
                  ].filter(Boolean).join(', ') || prop.address || prop.location || '';
                  return (
                    <tr key={prop.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap font-medium">{displayName}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{address}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{prop.price ? `$${Number(prop.price).toLocaleString()}` : '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{prop.bedrooms ?? '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{prop.bathrooms ?? '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap capitalize">{prop.status ?? 'active'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">
                        <div className="flex flex-col items-end gap-1">
                          <a
                            href={`/property/${prop.id}`}
                            className="text-blue-600 hover:underline font-medium text-sm"
                          >
                            View Details
                          </a>
                          <button
                            className="text-blue-600 hover:underline font-medium text-sm"
                            onClick={() => setModalProperty({
                              id: prop.id,
                              title: displayName || prop.name || prop.title || 'Untitled',
                              address: address || ''
                            })}
                          >
                            Contact an agent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Inquiry Modal */}
      <Modal isOpen={!!modalProperty} onClose={() => setModalProperty(null)}>
        {modalProperty && (
          <div>
            <div className="mb-4 text-center">
              <div className="font-bold text-lg">{modalProperty.title}</div>
              {modalProperty.address && <div className="text-gray-600">{modalProperty.address}</div>}
            </div>
            <InquiryForm
              propertyId={modalProperty.id}
              onSuccess={() => setModalProperty(null)}
            />
          </div>
        )}
      </Modal>
      <Footer />
    </PageTransition>
  );
};

export default PublicListings;
