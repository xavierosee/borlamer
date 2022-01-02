import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Borlamer',
      home: Scaffold(
        appBar: AppBar(
          title: const Text('Borlamer'),
        ),
        body: const Center(
          child: Text("C'est la merde"),
        ),
      ),
    );
  }
}
