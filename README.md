# Boids
## Credit
"Boids!" by Adams/Land at https://people.ece.cornell.edu/land/courses/ece4760/labs/s2021/Boids/Boids.html#ECE-4760,-Spring-2020,-Adams/Land
## Background
Boids is an artificial life program that produces startlingly realistic simulations of the flocking behavior of birds. Each "boid" (which is an abbreviation of "bird-oid object") follows a very simple set of rules. These rules will be discussed at length, but they can be summarized as follows:

* Separation: boids move away from other boids that are too close
* Alignment: boids attempt to match the velocities of their neighbors
* Cohesion: boids move toward the center of mass of their neighbors

When all of the boids follow these simple rules, the flock produces gorgeously organic-looking emergent patterns. The Boids algorithm was developed by Craig Reynolds in 1986. 

Inspiration video: https://www.youtube.com/watch?v=V4f_1_r80RY