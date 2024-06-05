const showRanges = false; // Draws protectedRange and visualRange

class Boid
{
    constructor(x, y, vx, vy)
    {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;

        this.size = 10;
        this.rotation = this.calculateRotation();
        
        this.protectedRange = this.size * 1.33;
        this.visualRange = this.size * 6.66;

        this.turnfactor = 0.2;
        this.centeringfactor = 0.0005;
        this.avoidfactor = 0.05;
        this.matchingfactor = 0.05;

        this.maxspeed = 3;
        this.minspeed = 2;
    }

    calculateRotation() 
    {
        let angleInRadians = Math.atan2(this.vy, this.vx);
        let angleInDegrees = angleInRadians * 180 / Math.PI + 90; // for some reason + 90 deg
        return angleInDegrees;
    }

    calculateDistance(otherboid)
    {
        let disX = otherboid.x - this.x;
        let disY = otherboid.y - this.y;
        let distance = Math.sqrt(disX * disX + disY * disY);
        return distance;
    }

    move()
    {
        // Separation: boids move away from other boids that are too close
        this.separation();
        // Alignment: boids attempt to match the velocities of their neighbors
        this.alignment();
        // Cohesion: boids move toward the center of mass of their neighbors
        this.cohesion();

        // Screen edges: We want our boids to turn-around at an organic-looking turn radius when they approach an edge of the TFT.
        this.screenEdges();
        // Speen limits: We constrain the boids to move faster than some minimum speed and slower than some maximum speed.
        this.speedLimits();

        // Update position
        this.x = this.x + this.vx;
        this.y = this.y + this.vy;

        // Rotate boid in direction
        this.rotation = this.calculateRotation()
    }

    separation()
    {
        // Each boid attempts to avoid running into other boids. 
        // If two or more boids get too close to one another (i.e. within one another's protected range), they will steer away from one another. 
        // They will do so in the following way:

        // 1. At the start of the update for a particular boid, two accumulating variable (close_dx and close_dy) are zeroed
        let close_dx = 0;
        let close_dy = 0;

        // 2. We loop thru every other boid. If the distance to a particular boid is less than the protected range, then
        for (let otherboid of boids) {
            if (otherboid !== this) {
                let distance = this.calculateDistance(otherboid);
                if (distance < this.protectedRange) {
                    close_dx += this.x - otherboid.x;
                    close_dy += this.y - otherboid.y;
                }
            }
        }

        // 3. Once we've looped through all other boids, then we update the velocity according to
        this.vx += close_dx * this.avoidfactor;
        this.vy += close_dy * this.avoidfactor;
    }

    alignment()
    {
        // Each boid attempts to match the velocity of other boids inside its visible range. 
        // It does so in the following way:

        // 1. At the start of the update for a particular boid, three variables (xvel_avg, yvel_avg, and neighboring_boids) are zeroed
        let xvel_avg = 0;
        let yvel_avg = 0;
        let neigboring_boids = 0;

        // 2. We loop thru every other boid. If the distance to a particular boid is less than the visible range, then
        for (let otherboid of boids) {
            if (otherboid !== this) {
                let distance = this.calculateDistance(otherboid);
                if (distance < this.visualRange) {
                    xvel_avg += otherboid.vx;
                    yvel_avg += otherboid.vy;
                    neigboring_boids += 1;
                }
            }
        }

        // 3. Once we've looped through all other boids, we do the following if neighboring_boids > 0:
        if (neigboring_boids > 0) {
            xvel_avg = xvel_avg / neigboring_boids;
            yvel_avg = yvel_avg / neigboring_boids;
        }

        // 4. We then update the velocity according to:
        this.vx += (xvel_avg - this.vx) * this.matchingfactor;
        this.vy += (yvel_avg - this.vy) * this.matchingfactor;
    }

    cohesion()
    {
        // Each boid steers gently toward the center of mass of other boids within its visible range. 
        // It does so in the following way:

        // 1. At the start of the update for a particular boid, three variables (xpos_avg, ypos_avg, and neighboring_boids) are zeroed
        let xpos_avg = 0;
        let ypos_avg = 0;
        let neigboring_boids = 0;

        // 2. We loop thru every other boid. If the distance to a particular boid is less than the visible range, then
        for (let otherboid of boids) {
            if (otherboid !== this) {
                let distance = this.calculateDistance(otherboid);
                if (distance < this.visualRange) {
                    xpos_avg += otherboid.x;
                    ypos_avg += otherboid.y;
                    neigboring_boids += 1;
                }
            }
        }

        // 3. Once we've looped through all other boids, we do the following if neighboring_boids > 0:
        if (neigboring_boids > 0) {
            xpos_avg = xpos_avg / neigboring_boids;
            ypos_avg = ypos_avg / neigboring_boids;
        }

        // 4. We then update the velocity according to:
        this.vx += (xpos_avg - this.x) * this.centeringfactor;
        this.vy += (ypos_avg - this.y) * this.centeringfactor;
    }

    screenEdges()
    {
        // We want our boids to turn-around at an organic-looking turn radius when they approach an edge of the TFT. 
        // We will do so in the following way:

        let margin = 50; // recommended 50 pixels

        let leftmargin = 0 + margin;
        let rightmargin = canvas.width - margin;
        let bottommargin = canvas.height - margin;
        let topmargin = 0 + margin;

        if (this.x < leftmargin) {
            this.vx = this.vx + this.turnfactor;
        }
        if (this.x > rightmargin) {
            this.vx = this.vx - this.turnfactor;
        }
        if (this.y > bottommargin) {
            this.vy = this.vy - this.turnfactor;
        }
        if (this.y < topmargin) {
            this.vy = this.vy + this.turnfactor;
        }
    }

    speedLimits()
    {
        // We constrain the boids to move faster than some minimum speed and slower than some maximum speed. 
        // We do so in the following way:

        // 1. Once the velocity has been updated, compute the boid speed
        let speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

        // 2. If speed > maxspeed:
        if (speed > this.maxspeed) {
            this.vx = (this.vx / speed) * this.maxspeed;
            this.vy = (this.vy / speed) * this.maxspeed;
        }

        // 3. If speed < minspeed:
        if (speed < this.minspeed) {
            this.vx = (this.vx / speed) * this.minspeed;
            this.vy = (this.vy / speed) * this.minspeed;
        }
    }

    draw()
    {
        ctx.save();

        // Rotate boid
        ctx.translate(this.x, this.y + this.size/2);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.translate(-this.x, -this.y - this.size/2);

        // If showRanges is true, draw protectedRange and visualRange
        if (showRanges) this.drawRanges();

        // Draw shape of boid
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.size/2, this.y + this.size);
        ctx.lineTo(this.x, this.y + this.size - this.size / Math.PI);
        ctx.lineTo(this.x - this.size/2, this.y + this.size);

        // Fill shape
        ctx.globalAlpha = 1;
        ctx.fillStyle = "white";
        ctx.fill();

        ctx.restore();
    }

    drawRanges()
    {
        // Draw visualRange first
        ctx.beginPath()
        ctx.arc(this.x, this.y + this.size/2, this.visualRange, 0, Math.PI * 2);
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = "white";
        ctx.fill();

        // Draw protectedRange on top
        ctx.beginPath()
        ctx.arc(this.x, this.y + this.size/2, this.protectedRange, 0, Math.PI * 2);
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = "white";
        ctx.fill();
    }
}