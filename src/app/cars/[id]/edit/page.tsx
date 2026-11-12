// CARS (edit)

// IMPORTS
import { notFound } from "next/navigation";
import { updateCar } from "@/actions/cars";
import { CarNav } from "@/components/CarNav";
import { CarForm } from "@/components/CarForm";
import { getCar } from "@/db/queries";


// MAIN FUNCTION
export default async function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCar(id);
  if (!car) notFound();
  return (

    <div>
      <CarNav car={car} segment="overview" />
      <div className="max-w-3xl">
        <h2 className="mb-6 text-xl font-semibold">Edit profile</h2>
        <CarForm car={car} action={updateCar} />
      </div>
    </div>
    
  );
}
