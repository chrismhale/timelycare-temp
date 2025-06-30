import React, { useEffect, useState } from 'react';
import { useFetchState } from 'hooks/useFetchState';
import { useApi } from 'hooks/useApi';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Select from './ui/Select';
import Button from './ui/Button';

interface Listing {
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
}

interface ListingFormProps {
  onSuccess: () => void;
  editing?: Listing | null;
  onClear?: () => void;
}

const initialState = {
  title: '',
  price: '',
  streetAddress1: '',
  streetAddress2: '',
  city: '',
  state: '',
  zipcode: '',
  bedrooms: '',
  bathrooms: '',
  description: '',
  status: 'active'
};

const ListingForm: React.FC<ListingFormProps> = ({ onSuccess, editing, onClear }) => {
  const [form, setForm] = useState<Listing>(initialState as Listing);
  const { isLoading, handle } = useFetchState<null>(null);
  const { request } = useApi();

  useEffect(() => {
    if (editing) setForm({
      ...initialState,
      ...editing
    });
    else setForm(initialState);
  }, [editing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/properties/${editing.id}` : '/properties';

    handle(() =>
      request(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
        successMessage: editing ? "Listing updated!" : "Listing created!",
        errorMessage: "Failed to save listing"
      })
    )
      .then(() => {
        setForm(initialState);
        onSuccess();
        if (editing && onClear) {
          onClear();
        }
      });
  };

  const handleCancel = () => {
    setForm(initialState);
    if(onClear) onClear();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-6 py-4 w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit' : 'Add New'} Property</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="title" value={form.title} onChange={handleChange} placeholder="Title" required className="col-span-2" />
        <Input name="streetAddress1" value={form.streetAddress1} onChange={handleChange} placeholder="Street Address 1" required />
        <Input name="streetAddress2" value={form.streetAddress2} onChange={handleChange} placeholder="Street Address 2 (optional)" />
        <Input name="city" value={form.city} onChange={handleChange} placeholder="City" required />
        <Select name="state" value={form.state} onChange={handleChange} required>
          <option value="">Select State</option>
          <option value="AL">Alabama</option>
          <option value="AK">Alaska</option>
          <option value="AZ">Arizona</option>
          <option value="AR">Arkansas</option>
          <option value="CA">California</option>
          <option value="CO">Colorado</option>
          <option value="CT">Connecticut</option>
          <option value="DE">Delaware</option>
          <option value="FL">Florida</option>
          <option value="GA">Georgia</option>
          <option value="HI">Hawaii</option>
          <option value="ID">Idaho</option>
          <option value="IL">Illinois</option>
          <option value="IN">Indiana</option>
          <option value="IA">Iowa</option>
          <option value="KS">Kansas</option>
          <option value="KY">Kentucky</option>
          <option value="LA">Louisiana</option>
          <option value="ME">Maine</option>
          <option value="MD">Maryland</option>
          <option value="MA">Massachusetts</option>
          <option value="MI">Michigan</option>
          <option value="MN">Minnesota</option>
          <option value="MS">Mississippi</option>
          <option value="MO">Missouri</option>
          <option value="MT">Montana</option>
          <option value="NE">Nebraska</option>
          <option value="NV">Nevada</option>
          <option value="NH">New Hampshire</option>
          <option value="NJ">New Jersey</option>
          <option value="NM">New Mexico</option>
          <option value="NY">New York</option>
          <option value="NC">North Carolina</option>
          <option value="ND">North Dakota</option>
          <option value="OH">Ohio</option>
          <option value="OK">Oklahoma</option>
          <option value="OR">Oregon</option>
          <option value="PA">Pennsylvania</option>
          <option value="RI">Rhode Island</option>
          <option value="SC">South Carolina</option>
          <option value="SD">South Dakota</option>
          <option value="TN">Tennessee</option>
          <option value="TX">Texas</option>
          <option value="UT">Utah</option>
          <option value="VT">Vermont</option>
          <option value="VA">Virginia</option>
          <option value="WA">Washington</option>
          <option value="WV">West Virginia</option>
          <option value="WI">Wisconsin</option>
          <option value="WY">Wyoming</option>
        </Select>
        <Input name="zipcode" value={form.zipcode} onChange={handleChange} placeholder="Zip Code" required />
        <div className="flex gap-4 col-span-2">
          <Input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} placeholder="Bedrooms" required className="flex-1" />
          <Input name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} placeholder="Bathrooms" required className="flex-1" />
        </div>
        <Input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" required className="col-span-2" />
        <Textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="col-span-2" />
        <Select name="status" value={form.status} onChange={handleChange} className="col-span-2">
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="sold">Sold</option>
        </Select>
      </div>
      <div className="flex gap-2 mt-4">
        <Button type="submit" disabled={isLoading} className="">
          {isLoading ? 'Saving...' : editing ? 'Update' : 'Create'} Listing
        </Button>
        {editing && <Button onClick={handleCancel} type="button" variant="outline">Cancel</Button>}
      </div>
    </form>
  );
};

export default ListingForm;
