# Ant-Colony-Optimization---Traveling-Salesman-Problem

## Project Overview

This is a Traveling Salesperson Problem (TSP) solver that uses the Ant Colony Optimization (ACO) algorithm. It features a visual, interactive simulation in a web browser, allowing users to place cities manually or generate them randomly. The core function is to iteratively find the shortest possible route by simulating ants leaving pheromone trails and showing the progressive convergence to the best path over time.

---

## How it Works

Ants Explore Cities: Many virtual ants are released. Each ant travels from one city to the next until it has visited every city and returned to the start, completing a full tour.

Pheromone is Laid Down: As an ant travels, it deposits a pheromone trail on every path (edge) it uses.

The Learning Rule: The key is that ants that find a short tour complete their path faster and therefore deposit much more pheromone on those short-route edges.

Influence and Reinforcement: In the next round, ants are more likely to choose paths that already have a stronger pheromone trail. This creates a positive feedback loop: the best path gets used more, which makes its trail even stronger.

Evaporation (Forgetting): Pheromone on long, unused, or poor paths gradually fades away. This stops the system from getting stuck on bad solutions.

---

## Features

•  Ant System Implementation: The core of the project uses the classic Ant System, which relies on pheromone trails and inverse distance (heuristic) to guide the ants.

•  Parameter Tuning: Key ACO parameters are defined and can be adjusted in the code to control the algorithm's behavior:

•	α (Alpha): Pheromone influence exponent.

•	β (Beta): Distance/Heuristic influence exponent.

•	ρ (Rho): Pheromone evaporation rate.

•  Adaptive Ant Count: The number of ants deployed scales automatically based on the complexity of the problem 8 x number of cities, ensuring efficient exploration.

•  Tour Completion: The ants are required to complete a full tour, returning to the starting city to calculate the final tour length and deposit pheromones.

---

## Limitations

Slow Convergence (Basic Algorithm): Your project uses the Ant System, which is the oldest and least efficient variant of ACO. It learns slowly compared to modern versions (like MMAS or ACS) because it lacks aggressive features to quickly focus the search on the best path found so far.

Poor Scalability (O(n3)): The time required to find a solution grows very quickly as you add more cities (n). Since the ant count is tied to the city count (≈20n), the calculations become incredibly slow beyond 100 cities (O(n3) complexity), pushing the limits of what a web browser can realistically handle.

## Installation Guide

Go to https://evildead11.github.io/Ant-Colony-Optimization---Traveling-Salesman-Problem/index.html to run the project.

OR

Install "Microsoft Visual Studio Code" and make a New forlder and add all 3 codes in it and use "Live Server" extension to run the index.html file.
