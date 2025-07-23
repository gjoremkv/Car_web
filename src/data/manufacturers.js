export const popularManufacturers = [
  'Volkswagen', 'Renault', 'Toyota', 'Peugeot', 'Mercedes-Benz', 'BMW', 'Skoda',
  'Ford', 'Audi', 'Fiat', 'Opel', 'Citroën', 'Nissan', 'Volvo', 'Tesla', 'Chevrolet'
];

export const allManufacturers = [
  ...popularManufacturers,
  // All other brands (A-Z)
  'Acura', 'Alfa Romeo', 'Aston Martin', 'Bentley', 'Bugatti', 'Cadillac',
  'Chrysler', 'Dacia', 'Daewoo', 'Daihatsu', 'Dodge', 'DS Automobiles', 'Ferrari',
  'Genesis', 'Geely', 'GMC', 'Great Wall', 'Holden', 'Honda', 'Hummer', 'Hyundai',
  'Infiniti', 'Isuzu', 'Jaguar', 'Jeep', 'Kia', 'Koenigsegg', 'Lada', 'Lamborghini',
  'Lancia', 'Land Rover', 'Lexus', 'Lincoln', 'Lotus', 'Lucid', 'Mahindra', 'Maserati',
  'Maybach', 'Mazda', 'McLaren', 'Mini', 'Mitsubishi', 'Nissan', 'Oldsmobile', 'Opel',
  'Pagani', 'Polestar', 'Pontiac', 'Porsche', 'Ram', 'Ravon', 'Rimac', 'Rolls-Royce',
  'Rover', 'Saab', 'Seat', 'Smart', 'SsangYong', 'Subaru', 'Suzuki', 'Zastava'
];

// Remove duplicates and sort the rest A-Z (excluding popular)
export const otherManufacturers = Array.from(
  new Set(allManufacturers.filter(m => !popularManufacturers.includes(m)))
).sort(); 