import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PropertyCard from "@/components/PropertyCard";
import { MemoryRouter } from "react-router-dom";

const mockProperty = {
  id: "123",
  name: "Modern Apartment",
  price: 350000,
  location: "123 Main St, Cityville",
  bedrooms: 3,
  bathrooms: 2,
  imageUrl: "/images/property1.jpg",
};

describe("PropertyCard", () => {
  test("renders property information", () => {
    render(
      <MemoryRouter>
        <PropertyCard {...mockProperty} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Modern Apartment/i)).toBeInTheDocument();
    expect(screen.getByText(/\$350,000/i)).toBeInTheDocument();
    expect(screen.getByText(/123 Main St, Cityville/i)).toBeInTheDocument();

    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.src).toContain(mockProperty.imageUrl);
    expect(img.alt).toBe("Modern Apartment");
  });

  test("renders price as not available if not a number", () => {
    render(
      <MemoryRouter>
        <PropertyCard id="2" name="No Price" price={"N/A" as any} location="Nowhere" bedrooms={1} bathrooms={1} />
      </MemoryRouter>
    );
    expect(screen.getByText('Price not available')).toBeInTheDocument();
  });

  test("has a view details link", () => {
    render(
      <MemoryRouter>
        <PropertyCard {...mockProperty} />
      </MemoryRouter>
    );
    const link = screen.getByRole("link", { name: /view details/i });
    expect(link).toHaveAttribute("href", `/property/${mockProperty.id}`);
  });

  test("can click view details link", () => {
    render(
      <MemoryRouter>
        <PropertyCard {...mockProperty} />
      </MemoryRouter>
    );
    const link = screen.getByRole("link", { name: /view details/i });
    fireEvent.click(link);
    // Navigation testing would require integration or mocking router; for now, ensure link exists
    expect(link).toBeInTheDocument();
  });
});
