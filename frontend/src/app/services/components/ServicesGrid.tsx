import ServiceCard from "./ServiceCard";
import type { Service } from "@/store/slices/serviceSlice";

interface ServicesGridProps {
  services: Service[];
}

export default function ServicesGrid({ services }: ServicesGridProps) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {services.map((service) => (
        <ServiceCard key={service._id} service={service} />
      ))}

      {services.length === 0 && (
        <div className="col-span-full rounded-2xl border border-[var(--gray-200)] bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--gray-50)] border border-[var(--gray-200)]">
            <div className="text-2xl">📦</div>
          </div>
          <h3 className="text-2xl font-extrabold text-[var(--gray-900)]">No Services Available</h3>
          <p className="mt-2 text-[var(--gray-700)] max-w-md mx-auto">
            We’re updating our service catalog. Please check back soon.
          </p>
        </div>
      )}
    </div>
  );
}
