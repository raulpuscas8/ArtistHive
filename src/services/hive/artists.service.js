// src/services/hive/artists.service.js

import { mocks, mockImages } from "./mock";
import camelize from "camelize";

export const artistsRequest = (location) => {
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
    return {
      ...artist,
      photos: artist.photos.map(
        () => mockImages[Math.ceil(Math.random() * (mockImages.length - 1))]
      ),
      address: artist.vicinity,
      rating: artist.rating ?? 0,
    };
  });
  return camelize(mappedResults);
};
