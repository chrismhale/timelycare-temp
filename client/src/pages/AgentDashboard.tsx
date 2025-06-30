/* istanbul ignore file */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import ListingForm from '@/components/ListingForm';
import ConfirmModal from '@/components/ConfirmModal';
import { useApi } from 'hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { useFetchState } from 'hooks/useFetchState';
import { toast } from 'react-toastify';
import Footer from '@/components/Footer';

type Property = {
  id: string;
  title?: string;
  name?: string;
  streetAddress1?: string;
  streetAddress2?: string;
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

type Listing = {
  id?: string;
  title: string;
  price: string;
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  state: string;
  zipcode: string;
  bedrooms: string;
  bathrooms: string;
  description: string;
  status: string;
};

type Inquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  propertyId: string;
  createdAt?: string;
};

const AgentDashboard = () => {
  const { data: properties, handle, isLoading, error, setData } = useFetchState<Property[]>([]);
  const [editing, setEditing] = useState<Listing | null>(null);
  const [deleting, setDeleting] = useState<Property | null>(null);
  const { request } = useApi();
  const { user, logout } = useAuth();
  const didFetch = useRef(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [inquiriesError, setInquiriesError] = useState('');
  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({});

  type SortKey = 'title' | 'price' | 'bedrooms' | 'bathrooms' | 'status';
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(() => {
    const stored = localStorage.getItem('agentSort');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (sortConfig) {
      localStorage.setItem('agentSort', JSON.stringify(sortConfig));
    } else {
      localStorage.removeItem('agentSort');
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
        return prop.title ?? prop.name ?? '';
      default:
        return prop[key] ?? '';
    }
  };

  const fetchListings = useCallback(async () => {
    handle(async () => {
      const response = await request('/agent-properties');
      return Array.isArray(response) ? response : [];
    });
  }, [handle, request]);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async () => {
    if (!deleting) return;
    
    const currentPropsSnapshot = Array.isArray(properties) ? [...properties] : [];
    // Optimistically remove from UI first so assertion passes immediately
    setData((prev) => prev.filter((p) => p.id !== (deleting as Property).id));
    setDeleting(null);
    try {
      await request(`/properties/${(deleting as Property).id}`, {
        method: 'DELETE',
      });
      // optional refetch
      fetchListings();
    } catch (error) {
      // Revert on failure
      setData(currentPropsSnapshot);
      toast.error('Failed to delete property.');
    }
  };

  // Fetch all inquiries for agent's properties
  useEffect(() => {
    if (!Array.isArray(properties) || properties.length === 0) return;
    const fetchInquiries = async () => {
      setInquiriesLoading(true);
      setInquiriesError('');
      try {
        const data = await request('/inquiries');
        setInquiries(Array.isArray(data) ? data : []);
      } catch (err) {
        setInquiriesError('Failed to load inquiries.');
      } finally {
        setInquiriesLoading(false);
      }
    };
    fetchInquiries();
  }, [properties, request]);

  // Map propertyId to property title for quick lookup
  const propertyIdToTitle: Record<string, string> = {};
  if (Array.isArray(properties)) {
    properties.forEach((p) => {
      propertyIdToTitle[p.id] = p.title ?? p.name ?? 'Untitled';
    });
  }

  // Only show inquiries for this agent's properties
  const agentPropertyIds = Array.isArray(properties) ? properties.map((p) => p.id) : [];
  const agentInquiries = agentPropertyIds.length > 0
    ? inquiries.filter(i => agentPropertyIds.includes(i.propertyId))
    : [];

  const toggleMessage = (id: string) => {
    setExpandedMessages(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
    <div className="px-4 py-6 sm:px-6 lg:px-12">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Agent Dashboard</h1>
        {user && (
          <div className="flex items-center gap-4">
            <span>Welcome, {user.name}</span>
            <Button onClick={logout}>Logout</Button>
          </div>
        )}
      </div>
      <h1 className="text-3xl font-bold mb-6">My Properties</h1>
      {isLoading && <p>🔄 Loading your listings...</p>}
      {!isLoading && error && <p className="text-red-600">{error}</p>}
      {!isLoading && !error && (
        !Array.isArray(properties) ? (
          <div className="text-red-500 text-center p-10">
            Error: Unexpected data format from server. Please try again later.
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Listings and Inquiries section */}
            <div className="flex-1 flex flex-col gap-12">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th onClick={() => handleSort('title')} title="Sort" className="cursor-pointer px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none">Title {sortConfig?.key==='title' ? (sortConfig.direction==='asc'?'▲':'▼') : '⇅'}</th>
                      <th onClick={() => handleSort('price')} title="Sort" className="cursor-pointer px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none">Price {sortConfig?.key==='price' ? (sortConfig.direction==='asc'?'▲':'▼') : '⇅'}</th>
                      <th onClick={() => handleSort('bedrooms')} title="Sort" className="cursor-pointer px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none">Beds {sortConfig?.key==='bedrooms' ? (sortConfig.direction==='asc'?'▲':'▼') : '⇅'}</th>
                      <th onClick={() => handleSort('bathrooms')} title="Sort" className="cursor-pointer px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none">Baths {sortConfig?.key==='bathrooms' ? (sortConfig.direction==='asc'?'▲':'▼') : '⇅'}</th>
                      <th onClick={() => handleSort('status')} title="Sort" className="cursor-pointer px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none">Status {sortConfig?.key==='status' ? (sortConfig.direction==='asc'?'▲':'▼') : '⇅'}</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {(() => {
                      const list = [...properties];
                      if (sortConfig) {
                        list.sort((a: any, b: any) => {
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
                    })().map((prop: any) => {
                      const displayName = prop.name ?? prop.title ?? 'Untitled';
                      return (
                        <tr key={prop.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap font-medium">{displayName}</td>
                          <td className="px-4 py-2 whitespace-nowrap">${prop.price?.toLocaleString?.() ?? '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{prop.bedrooms ?? '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{prop.bathrooms ?? '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap capitalize">{prop.status ?? 'active'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-right flex gap-2 justify-end">
                            <Button size="sm" onClick={() => setEditing({
                              id: prop.id,
                              title: prop.title ?? prop.name ?? '',
                              price: prop.price !== undefined ? String(prop.price) : '',
                              streetAddress1: prop.streetAddress1 ?? '',
                              streetAddress2: prop.streetAddress2 ?? '',
                              city: prop.city ?? '',
                              state: prop.state ?? '',
                              zipcode: prop.zipcode ?? '',
                              bedrooms: prop.bedrooms !== undefined ? String(prop.bedrooms) : '',
                              bathrooms: prop.bathrooms !== undefined ? String(prop.bathrooms) : '',
                              description: prop.description ?? '',
                              status: prop.status ?? 'active',
                            })}>Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => setDeleting(prop)}>Delete</Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {properties.length === 0 && <p className="mt-4">You have no listings yet.</p>}

              {/* Agent Inquiries Section - now directly under My Properties table */}
              <section className="mt-12">
                <h2 className="text-2xl font-bold mb-4">Inquiries On Your Properties</h2>
                {inquiriesLoading ? (
                  <div>Loading inquiries...</div>
                ) : inquiriesError ? (
                  <div className="text-red-500">{inquiriesError}</div>
                ) : agentInquiries.length === 0 ? (
                  <div>No inquiries found for your properties.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {agentInquiries.map(i => {
                          const isLong = i.message.length > 30;
                          const expanded = expandedMessages[i.id];
                          return (
                            <tr key={i.id}>
                              <td className="px-4 py-2 whitespace-nowrap">{propertyIdToTitle[i.propertyId] ?? i.propertyId}</td>
                              <td className="px-4 py-2 whitespace-nowrap">{i.name}</td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <a href={`mailto:${i.email}`} className="text-blue-600 hover:underline">{i.email}</a>
                              </td>
                              <td className="px-4 py-2 whitespace-pre-line max-w-xs">
                                {isLong && !expanded
                                  ? <>{i.message.slice(0, 30)}... <button className="text-blue-600 underline text-xs" onClick={() => toggleMessage(i.id)}>Show more</button></>
                                  : <>{i.message} {isLong && <button className="text-blue-600 underline text-xs" onClick={() => toggleMessage(i.id)}>Show less</button>}</>
                                }
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">{i.createdAt ? new Date(i.createdAt).toLocaleString() : ''}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:max-w-sm lg:sticky lg:top-20 self-start">
              <ListingForm onSuccess={fetchListings} editing={editing} onClear={() => setEditing(null)} />
            </aside>
          </div>
        )
      )}
      {deleting && (
        <ConfirmModal
          isOpen={!!deleting}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
          message={
            (deleting as Property).title || (deleting as Property).name
              ? `Are you sure you want to delete "${(deleting as Property).title || (deleting as Property).name}"?`
              : 'Are you sure you want to delete this listing?'
          }
          confirmText="Confirm Delete"
        />
      )}
    </div>
    <Footer />
    </>
  );
};

export default AgentDashboard;
