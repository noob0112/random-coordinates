import * as d3Random from "d3-random";
import * as d3Geo from "d3-geo";
import * as topojson from "topojson-client";
import fs from "fs";

const world = JSON.parse(fs.readFileSync("countries-110m.json"));
const countries = topojson.feature(world, world.objects.countries);

function randomBoundingBoxCoordinates(boundingBox) {
  const randomLongitude = d3Random.randomUniform(
    boundingBox[0][0],
    boundingBox[1][0] + 360 * (boundingBox[1][0] < boundingBox[0][0])
  );
  const randomLatitude = d3Random.randomUniform(
    boundingBox[0][1],
    boundingBox[1][1]
  );
  return () => [randomLongitude(), randomLatitude()];
}

function randomFeatureCoordinates(feature) {
  const featureBoundingBox = d3Geo.geoBounds(feature);
  const randomCoordinates = randomBoundingBoxCoordinates(featureBoundingBox);
  return () => {
    let p;
    do {
      p = randomCoordinates();
    } while (!d3Geo.geoContains(feature, p));
    return p;
  };
}

function countryFeature(countryName) {
  return countries.features.filter((f) => f.properties.name === countryName)[0];
}

export function randomCountryCoordinates(countryName, times = 1) {
  const country = countryFeature(countryName);
  if (!country) {
    throw new Error('country is incorrect');
  }
  const randomCoordinates = randomFeatureCoordinates(country);

  let result = [];
  for (let i = 0; i < times; i++) {
    result = [...result, randomCoordinates()];
  }
  return result;
}
