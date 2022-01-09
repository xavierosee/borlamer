import 'package:flutter/material.dart';
import 'package:mapbox_gl/mapbox_gl.dart';

class MapScreen extends StatefulWidget {
  const MapScreen();

  @override
  State createState() => MapScreenState();
}

class MapScreenState extends State<MapScreen> {
  MapboxMapController? mapController;
  var isLight = true;

  _onMapCreated(MapboxMapController controller) {
    mapController = controller;
  }

  _onStyleLoadedCallback() {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: const Text("Successfully loaded style"),
        backgroundColor: Theme.of(context).primaryColor,
        duration: const Duration(seconds: 1)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: const Text('Borlamer')),
        body: MapboxMap(
            styleString:
                isLight ? MapboxStyles.MAPBOX_STREETS : MapboxStyles.DARK,
            onStyleLoadedCallback: _onStyleLoadedCallback,
            accessToken: const String.fromEnvironment("ACCESS_TOKEN"),
            onMapCreated: _onMapCreated,
            initialCameraPosition: const CameraPosition(
                target: LatLng(16.241100, -61.533100), zoom: 9)));
  }
}
