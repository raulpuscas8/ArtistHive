import { mocks, mockImages } from "./mock";
import camelize from "camelize";

export const artistsRequest = (location) => {
  // console.log(JSON.stringify(camelize(mappedResults), null, 2));

  return new Promise((resolve, reject) => {
    const mock = mocks[location];
    if (!mock) {
      reject("not found");
    }
    resolve(mock);
  });
};

export const artistsTransform = ({ results = [] }) => {
  const mappedResults = results.map((artist) => {
    artist.photos = artist.photos.map((p) => {
      return mockImages[Math.ceil(Math.random() * (mockImages.length - 1))];
    });
    return {
      ...artist,
      address: artist.vicinity,
      isOpenNow: artist.opening_hours && artist.opening_hours.open_now,
      isClosedTemporarily: artist.business_status === "CLOSED TEMPORARILY",
    };
  });
  return camelize(mappedResults);
};
