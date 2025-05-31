import clientPromise from "@/lib/mongodb";
import doctors from "@/data/doctors.json";

async function importDoctors() {
  const client = await clientPromise;
  const db = client.db("doctorDB");
  const result = await db.collection("doctors").insertMany(doctors);
  console.log(`${result.insertedCount} doctors inserted!`);
}

importDoctors();
