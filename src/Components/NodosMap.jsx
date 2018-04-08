import React from 'react';
import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = process.env.REACT_APP_MAPBOXAPIKEY;


let mapdata = require('../data/nodesmap.geojson.json');


export default class NodosMap extends React.Component {
	componentDidMount() {
		const map = new mapboxgl.Map({
			container: 'map',
			// style: 'mapbox://styles/mapbox/streets-v10',
			style: 'mapbox://styles/mapbox/light-v9',
			center: [-102.6809429, 23.8821016],
			zoom: 5
		});
		this.map = map;
		map.on('load', () => {
			// return true;
			map.addLayer({
				id: 'nodosp',
				type: 'circle',
				source: {
					type: 'geojson',
					data: mapdata
				},
				paint: {
					'circle-color': [
						'match',
						['get', 'region'],
						'BAJA CALIFORNIA', '#8E5BA3',
						'BAJA CALIFORNIA SUR', '#223b53',
						'CENTRAL', '#9fd356',
						'NORESTE', '#3bb2d0',
						'NOROESTE', '#1b998b',
						'NORTE', '#fbb03b',
						'OCCIDENTAL', '#3c91e6',
						'ORIENTAL', '#e55e5e',
						'PENINSULAR', '#fa824c',
						'#ccc'
					],
					'circle-radius': {
						'base': 1.75,
						'stops': [[5, 2], [12, 10]]
					},
				}
			});
			let popup = new mapboxgl.Popup({
				closeButton: false,
				closeOnClick: false
			});
			map.on('mouseenter', 'nodosp', (e) => {
				map.getCanvas().style.cursor = 'pointer';
				let coordinates = e.features[0].geometry.coordinates.slice();
				let description = `<strong>CLAVE: </strong> ${e.features[0].properties.clave} <br> <strong>LOCALIDAD: </strong> ${e.features[0].properties.localidad} <br> <strong>REGION: </strong> ${e.features[0].properties.region}`;

				while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
					coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
				}

				// Populate the popup and set its coordinates
				// based on the feature found.
				popup.setLngLat(coordinates)
					.setHTML(description)
					.addTo(map);
			});
			map.on('mouseleave', 'nodosp', function() {
				map.getCanvas().style.cursor = '';
				popup.remove();
		    });
		});
	}
	render() {
		return(
			<div className="mapContainer">
				<div id="map"></div>
			</div>
		);
	}
}
