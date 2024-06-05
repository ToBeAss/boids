// Define global variables and call setup function
const amountOfBoids = 500; // Desired amount of boids
var boids = [];
setup();

function setup()
{
    // Create Boids
    for (let i = 0; i < amountOfBoids; i++)
    {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let vx = Math.random();
        let vy = Math.random();

        boids.push(new Boid(x, y, vx, vy));
    }

    // Call update function
    update();
}

function update()
{
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let boid of boids)
    {
        boid.move();
        boid.draw();
    }

    // Call update function 30 times per second 
    setTimeout(update, 1000/30);
}