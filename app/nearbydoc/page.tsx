// app/doctors/page.tsx
import MainLayout from '@/components/MainLayout';
import { Star, Phone, Calendar, MapPin } from 'lucide-react';

export default function DoctorsPage() {
  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "General Physician",
      address: "Aga Khan University Hospital",
      city: "Karachi",
      rating: 4.8,
      distance: "0.5 mi",
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Internal Medicine",
      address: "City Hospital",
      city: "Karachi",
      rating: 4.6,
      distance: "1.2 mi",
    },
    {
      id: 3,
      name: "Dr. Priya Patel",
      specialty: "Family Medicine",
      address: "Dow Medical Center",
      city: "Karachi",
      rating: 4.9,
      distance: "0.8 mi",
    }
  ];

  return (
    <MainLayout>
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b-2 border-black p-4">
          <h1 className="text-2xl font-bold flex items-center">
            <MapPin className="mr-2" /> Nearby Doctors
          </h1>
          <p className="text-black mt-2">Find healthcare providers in your area</p>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-4 md:grid-cols-2">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="border-2 border-black rounded-lg p-4 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                >
                  <h3 className="font-bold">{doctor.name}</h3>
                  <p className="text-sm font-medium">{doctor.specialty}</p>
                  <p className="text-sm">{doctor.address}, {doctor.city}</p>

                  <div className="flex items-center text-sm font-medium my-2">
                    <Star className="text-yellow-500 mr-1" size={14} />
                    <span>{doctor.rating}</span>
                    <span className="mx-2">•</span>
                    <span>{doctor.distance}</span>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 py-2 
                                     bg-[#f8fed5] text-black font-bold rounded-lg 
                                     border-2 border-black 
                                     shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                                     hover:bg-[#e0f081] 
                                     hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] 
                                     hover:translate-x-[1px] hover:translate-y-[1px] 
                                     transition-all text-sm">
                      <Phone className="mr-2 inline" size={14} /> Call
                    </button>
                    <button
                      className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 border-black bg-gray-200 cursor-not-allowed`}
                      disabled={true}
                    >
                      <Calendar className="mr-2 inline" size={14} /> Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
