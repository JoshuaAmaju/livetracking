import "mapbox-gl/dist/mapbox-gl.css";

import "./styles.css";

import { useState, createRef, useEffect, useMemo } from "react";

import { useQuery } from "react-query";

import mapboxgl from "mapbox-gl";

import MapView, {
  Layer,
  MapRef,
  NavigationControl,
  ScaleControl,
  Source,
} from "react-map-gl";

const initialViewState = {
  zoom: 14,
  latitude: 6.4233854,
  longitude: 3.3139548,
};

const mapboxToken =
  "pk.eyJ1Ijoiam9zaHBvbGFyaXMiLCJhIjoiY2wxNTVtZGF1MGx4eTNkcWFlZWxuZXd1NCJ9.TksW__t1YzMKcofsIU3k_A";

const token =
  "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzdXBlcmFkbWluIiwiaWF0IjoxNjczOTY1Mjg3LCJleHAiOjE2NzM5NzIzODh9.zY2QzjCqXBfIQ8NDUw9QfTR2n9qkZUVWiaEUJQBNU8G6fNxl69hkDgPj-5B9I4LEM08o6_USSarobCHYndmg9A";

export default function App() {
  const mapRef = createRef<MapRef>();

  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  const query = useQuery(
    ["tracks"],
    async () => {
      const res = await fetch(
        "http://35.208.196.20:8000/vessel/api/v1/4/track?date=2023-01-16&startTime=09:00&endTime=10:00",
        { headers: { Authorization: "Bearer " + token } }
      );

      console.log(res);
      const json = await res.json();
      console.log(json);

      return json as {
        data: Array<{
          id: string;
          speed: number;
          angle: number;
          gpsTime: number;
          gpsDate: string;
          vesselId: number;
          latitude: number;
          longitude: number;
          trackerId: number;
          locationId: string;
          createdDate: number;
          processingTime: number;
          lastModifiedDate: number;
        }>;
      };
    },
    { refetchInterval: false }
  );

  const data = useMemo(() => {
    return query.data && query.data.data
      ? query.data.data.map(({ latitude, longitude, ...d }) => {
          const feature = {
            properties: d,
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
          } as const;

          return feature;
        })
      : null;
  }, [query.data]);

  console.log(data);

  useEffect(() => {
    if (query.data && map) {
      const { data } = query.data;

      const head = [data[0].longitude, data[0].latitude] as mapboxgl.LngLatLike;

      // Create a 'LngLatBounds' with both corners at the first coordinate.
      const bounds = new mapboxgl.LngLatBounds(head, head);

      // Extend the 'LngLatBounds' to include every coordinate in the bounds result.
      for (const coord of data) {
        bounds.extend([coord.longitude, coord.latitude]);
      }

      map.fitBounds(bounds, { padding: 20 });
    }
  }, [query.data, map]);

  return (
    <div className="App">
      <MapView
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        onLoad={(e) => setMap(e.target)}
        initialViewState={initialViewState}
        mapStyle="mapbox://styles/mapbox/streets-v11"
      >
        {data ? (
          <Source
            type="geojson"
            data={{ type: "FeatureCollection", features: data as any }}
          >
            <Layer
              {...{
                type: "circle",
                paint: {
                  "circle-radius": 2,
                  "circle-opacity": 1,
                  "circle-color": "#000",
                  "circle-stroke-width": 2,
                  "circle-stroke-color": "#fff",
                },
              }}
            />

            <Layer
              {...{
                type: "line",
                paint: {
                  "line-width": 1,
                  "line-color": "#ff7676",
                },
              }}
            />
          </Source>
        ) : null}

        <NavigationControl />
        <ScaleControl />
      </MapView>
    </div>
  );
}
