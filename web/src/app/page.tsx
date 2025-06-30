import dynamic from 'next/dynamic';

const PropertyListingsClient = dynamic(() => import('@/components/PropertyListingsClient'), { ssr: false });

export default function Home() {
  return <PropertyListingsClient />;
}
