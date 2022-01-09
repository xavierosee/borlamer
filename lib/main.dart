import 'package:flutter/material.dart';

import 'UI/example_map_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(title: 'Borlamer', home: MapScreen());
  }
}
