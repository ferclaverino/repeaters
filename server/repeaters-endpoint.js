const repeaters = [
  {
    name: "Radio Club Argentino",
    signal: "LU4AA",
    frequency: 146910,
    diff: -600,
    subtone: 123,
    latitude: -34.6437888,
    longitude: -58.4162405,
  },
  {
    name: "RADIO CLUB QUILMES",
    signal: "LU4DQ",
    frequency: 145390,
    diff: -600,
    subtone: 131.8,
    latitude: -34.716667,
    longitude: -58.25,
  },
];

export function getAll(req, res) {
  res.json(repeaters);
}
