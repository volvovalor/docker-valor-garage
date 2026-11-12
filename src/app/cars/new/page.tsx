// CARS (new)
import { createCar } from "@/actions/cars";
import { CarForm } from "@/components/CarForm";

// EXPORTS
export default function NewCarPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">Add car</h1>
      <CarForm action={createCar} />
    </div>
  );
}
