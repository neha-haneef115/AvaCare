import { 
  MapPin, 
  Star, 
  Phone, 
  Calendar
} from "lucide-react";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  distance: string;
  available: boolean;
  nextAvailable: string;
}

interface NearbyDoctorsProps {
  userLocation: boolean;
  onLocationDetect: () => void;
}

export default function NearbyDoctors({ userLocation, onLocationDetect }: NearbyDoctorsProps) {
  const doctors: Doctor[] = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "General Physician",
      rating: 4.8,
      distance: "0.5 mi",
      available: true,
      nextAvailable: "Today 3:00 PM"
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Internal Medicine",
      rating: 4.6,
      distance: "1.2 mi",
      available: false,
      nextAvailable: "Tomorrow 10:00 AM"
    },
    {
      id: 3,
      name: "Dr. Priya Patel",
      specialty: "Family Medicine",
      rating: 4.9,
      distance: "0.8 mi",
      available: true,
      nextAvailable: "Today 5:30 PM"
    },
    {
      id: 4,
      name: "Dr. James Rodriguez",
      specialty: "Emergency Medicine",
      rating: 4.7,
      distance: "2.1 mi",
      available: true,
      nextAvailable: "Today 1:00 PM"
    },
    {
      id: 5,
      name: "Dr. Emma Thompson",
      specialty: "Internal Medicine",
      rating: 4.9,
      distance: "1.5 mi",
      available: false,
      nextAvailable: "Today 6:00 PM"
    },
    {
      id: 6,
      name: "Dr. Kevin Park",
      specialty: "Family Medicine",
      rating: 4.5,
      distance: "0.9 mi",
      available: true,
      nextAvailable: "Tomorrow 9:00 AM"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white border-2 border-black rounded-lg overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="p-4 bg-[#f8fed5] border-b-2 border-black">
        <h2 className="text-lg font-bold">Nearby Healthcare Providers</h2>
        <p className="text-sm font-medium">
          {userLocation ? "Sorted by availability and distance" : "Enable location to find doctors near you"}
        </p>
      </div>
      
      <div className="p-4">
        {!userLocation ? (
          <div className="text-center py-8">
            <button
              onClick={onLocationDetect}
              className="flex items-center px-8 py-4 
                       bg-[#f5ff23] 
                       text-black font-bold rounded-lg 
                       border-2 border-black 
                       shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                       hover:bg-[#E5Ef20] 
                       hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                       hover:translate-x-[2px] hover:translate-y-[2px] 
                       transition-all mx-auto"
            >
              <MapPin className="mr-2" /> Find Healthcare Providers
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="border-2 border-black rounded-lg p-4 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
              >
                <h3 className="font-bold">{doctor.name}</h3>
                <p className="text-sm font-medium text-gray-600">{doctor.specialty}</p>
                
                <div className="flex items-center text-sm font-medium my-2">
                  <Star className="text-yellow-500 mr-1" size={14} />
                  <span>{doctor.rating}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-600">{doctor.distance}</span>
                </div>
                
                <div className={`text-sm font-bold mb-4 ${doctor.available ? "text-green-600" : "text-gray-500"}`}>
                  {doctor.available ? `✅ Available ${doctor.nextAvailable}` : `⏰ Next available ${doctor.nextAvailable}`}
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 py-2 
                                   bg-[#f8fed5] text-black font-bold rounded-lg 
                                   border-2 border-black 
                                   shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                                   hover:bg-[#e0f081] 
                                   hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] 
                                   hover:translate-x-[1px] hover:translate-y-[1px] 
                                   transition-all text-xs">
                    <Phone className="mr-1 inline" size={12} /> Call
                  </button>
                  <button
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border-2 border-black ${
                      doctor.available
                        ? "bg-[#f5ff23] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#E5Ef20] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                        : "bg-gray-200 cursor-not-allowed"
                    }`}
                    disabled={!doctor.available}
                  >
                    <Calendar className="mr-1 inline" size={12} /> Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}